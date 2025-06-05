import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient'; // Import your Supabase client
import { Search, Grid, List, Download, Filter, ArrowDownUp } from 'lucide-react'; // Lucide icons for UI

// Define the type for a single Instagram post object expected from the Edge Function
interface InstagramPost {
  platform: string;
  postUrl: string;
  imageUrl?: string; // Optional as not always available or needed for embed
  caption: string;
  likes: number;
  comments: number;
  username: string;
  // Add any other properties you expect from your Apify Actor's output
}

// --- Microlink Embed Component ---
interface MicrolinkEmbedProps {
  url: string;
}

const MicrolinkEmbed: React.FC<MicrolinkEmbedProps> = ({ url }) => {
  return (
    <div className="microlink-embed-container w-full h-auto min-h-[200px] bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
      {url ? (
        <iframe
          src={`https://api.microlink.io/embed/?url=${encodeURIComponent(url)}`}
          className="w-full h-full border-0"
          style={{ minHeight: '200px' }}
          title={`Embed for ${url}`}
          loading="lazy"
        ></iframe>
      ) : (
        <p className="text-gray-400">No embed URL provided.</p>
      )}
    </div>
  );
};

// --- ExplorePage Component ---
const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram'); // Default to Instagram
  const [results, setResults] = useState<InstagramPost[]>([]); // Type the results state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Type error as string or null
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid'); // Specific string literal types
  const [sortOrder, setSortOrder] = useState<'default' | 'likes_desc' | 'likes_asc'>('default'); // Specific string literal types

  // Filter and sort the results based on current settings
  const filteredAndSortedResults = useMemo<InstagramPost[]>(() => {
    let sortableResults = [...results]; // Create a mutable copy

    if (sortOrder === 'likes_desc') {
      sortableResults.sort((a, b) => b.likes - a.likes); // Sort descending by likes
    } else if (sortOrder === 'likes_asc') {
      sortableResults.sort((a, b) => a.likes - b.likes); // Sort ascending by likes
    }
    // 'default' implies no specific sorting applied, maintaining fetched order

    return sortableResults;
  }, [results, sortOrder]); // Recalculate if results or sortOrder changes


  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim(); // Trim the search query here

    if (!trimmedQuery) { // Check if the trimmed query is empty
      setError('Please enter a search query.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results

    try {
      if (selectedPlatform === 'instagram') {
        console.log('Frontend: Attempting to invoke Edge Function "instagram-explore"...');
        const requestPayload = {
          query: trimmedQuery,
          searchType: 'handle',
          limit: 20,
        };
        console.log('Frontend: Request Payload (raw object):', requestPayload); // Log the raw object

        const { data, error: edgeFunctionError } = await supabase.functions.invoke('instagram-explore', {
          // FIX: Pass the raw JavaScript object directly to 'body'
          // Supabase client will handle JSON.stringify internally for Edge Functions
          body: requestPayload,
          // Removed manual 'Content-Type' header as invoke() handles it
        });

        if (edgeFunctionError) {
          console.error("Supabase Edge Function Invoke Error:", edgeFunctionError);
          console.error("Edge Function Error Details:", edgeFunctionError);
          let errorMessage = edgeFunctionError.message || 'Failed to connect to Instagram Explore service.';
          if (edgeFunctionError.details && edgeFunctionError.details.error) {
            errorMessage = edgeFunctionError.details.error;
          } else if (edgeFunctionError.status) {
              errorMessage += ` (Status: ${edgeFunctionError.status})`;
          }
          setError(errorMessage);
          return;
        }

        if (data && typeof data === 'object' && 'success' in data && data.success && Array.isArray(data.data)) {
          setResults(data.data as InstagramPost[]);
        } else {
          setError((data && data.error) || 'Failed to fetch Instagram data from service.');
        }
      } else {
        setError('Search for this platform is not yet implemented.');
      }

    } catch (err: any) {
      console.error("An unexpected error occurred during search:", err);
      setError(err.message || 'An unexpected error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-900 rounded-lg shadow-lg overflow-y-auto">
      <h2 className="text-3xl font-bold text-white mb-6">Explore Viral Posts</h2>
      <p className="text-gray-300 mb-4">
        Search Instagram profiles and sort their posts by likes for your personal project.
      </p>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6 p-4 bg-gray-800 rounded-lg shadow-inner">
        <select
          className="px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedPlatform}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPlatform(e.target.value)}
        >
          <option value="instagram">Instagram</option>
          <option value="x" disabled>X (Twitter) (Coming Soon)</option>
          <option value="youtube" disabled>YouTube (Coming Soon)</option>
          <option value="tiktok" disabled>TikTok (Coming Soon)</option>
          <option value="facebook" disabled>Facebook (Coming Soon)</option>
        </select>

        <input
          type="text"
          placeholder="Search @username (e.g., @nasa)"
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <Search size={20} className="mr-2" /> Search
            </>
          )}
        </button>

        <div className="flex rounded-md overflow-hidden bg-gray-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-600'} text-white transition-colors duration-200`}
            title="Grid View"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 ${viewMode === 'table' ? 'bg-blue-600' : 'hover:bg-gray-600'} text-white transition-colors duration-200`}
            title="Table View"
          >
            <List size={20} />
          </button>
        </div>

        {results.length > 0 && (
          <select
            className="px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortOrder}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as 'default' | 'likes_desc' | 'likes_asc')}
          >
            <option value="default">Sort: Default</option>
            <option value="likes_desc">Sort: Likes (High to Low)</option>
            <option value="likes_asc">Sort: Likes (Low to High)</option>
          </select>
        )}

        <button className="p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200" title="Filters">
          <Filter size={20} />
        </button>
        <button className="p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200" title="Export">
          <Download size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-md mb-4">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-white text-lg mt-8">
          <svg className="animate-spin mx-auto h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2">Fetching posts from Instagram profile...</p>
        </div>
      )}

      {!loading && results.length === 0 && searchQuery.trim() && ( // Use searchQuery.trim() here for conditional display
        <div className="text-center text-gray-400 text-lg mt-8">
          No posts found for this profile. Please ensure the username is correct and the profile is public.
        </div>
      )}

      {results.length > 0 && (
        <div className={`mt-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
          {filteredAndSortedResults.map((post: InstagramPost, index: number) => (
            <div key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {viewMode === 'grid' ? (
                <>
                  <div className="w-full h-auto">
                    <MicrolinkEmbed url={post.postUrl} />
                  </div>
                  <div className="p-4">
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">{post.caption}</p>
                    <div className="text-gray-400 text-xs flex items-center mb-2">
                      <span className="mr-3">❤️ {post.likes}</span>
                      <span className="mr-3">💬 {post.comments}</span>
                    </div>
                    <p className="text-gray-500 text-xs">
                      @{post.username} on {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </p>
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                        Add to Library
                      </button>
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-1 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors text-center"
                      >
                        Open Original
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center p-4 border-b border-gray-700 last:border-b-0">
                  <div className="w-20 h-20 mr-4 flex-shrink-0">
                    <MicrolinkEmbed url={post.postUrl} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold line-clamp-1">{post.caption || 'No caption'}</p>
                    <p className="text-gray-400 text-sm">@{post.username} on {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}</p>
                    <div className="text-gray-500 text-xs mt-1">
                      <span>❤️ {post.likes}</span> | <span>💬 {post.comments}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      Add to Library
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
