// Filename: explorepage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  Search, Grid, List, Download, Filter, Heart, MessageCircle, Info, X, Instagram, Youtube, Twitter, Facebook, Send, ExternalLink
} from 'lucide-react';
import MicrolinkEmbed from '../components/MicrolinkEmbed';

interface InstagramPost {
  platform: string;
  postUrl: string;
  imageUrl?: string;
  caption: string;
  likes: number;
  comments: number;
  username: string;
}

const PlatformIcon: React.FC<{ platform: string, size?: number, className?: string }> = ({ platform, size = 16, className = "" }) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram size={size} className={className} />;
    case 'youtube': return <Youtube size={size} className={className} />;
    case 'x': case 'twitter': return <Twitter size={size} className={className} />;
    case 'facebook': return <Facebook size={size} className={className} />;
    default: return <Grid size={size} className={className} />;
  }
};

const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [results, setResults] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortOrder, setSortOrder] = useState<'default' | 'likes_desc' | 'likes_asc'>('default');

  // Modal State
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Effect to handle body scroll when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { // Cleanup on component unmount
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);


  const filteredAndSortedResults = useMemo<InstagramPost[]>(() => {
    let sortableResults = [...results];
    if (sortOrder === 'likes_desc') {
      sortableResults.sort((a, b) => b.likes - a.likes);
    } else if (sortOrder === 'likes_asc') {
      sortableResults.sort((a, b) => a.likes - b.likes);
    }
    return sortableResults;
  }, [results, sortOrder]);

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setError('Please enter a profile username to search.');
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      if (selectedPlatform === 'instagram') {
        const requestPayload = { query: trimmedQuery, searchType: 'handle', limit: 20 };
        const { data, error: edgeFunctionError } = await supabase.functions.invoke('instagram-explore', {
          body: requestPayload,
        });
        if (edgeFunctionError) {
          let errorMessage = edgeFunctionError.message || 'Failed to connect to service.';
          if ((edgeFunctionError as any).details?.error) {
            errorMessage = (edgeFunctionError as any).details.error;
          } else if ((edgeFunctionError as any).status) {
            errorMessage += ` (Status: ${(edgeFunctionError as any).status})`;
          }
          setError(errorMessage);
          return;
        }
        if (data?.success && Array.isArray(data.data)) {
          setResults(data.data as InstagramPost[]);
        } else {
          setError(data?.error || 'Failed to fetch data from service.');
        }
      } else {
        setError('Search for this platform is not yet implemented.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const openPostModal = (post: InstagramPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const commonInputBaseStyles = "bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-colors duration-150";
  const searchInputStyles = `${commonInputBaseStyles} rounded-full py-2.5 pl-12 pr-10 text-sm w-full`; // Increased pr for clear button
  const selectStyles = `${commonInputBaseStyles} rounded-lg py-2 px-3 text-sm`;
  const iconButtonStyles = "p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-colors";

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-950 text-gray-300">
      {/* Top Search Bar Area - Sticky */}
      <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-100 hidden sm:block">Explore Content</h1>
            </div>
            <div className="flex-grow flex justify-center px-2 lg:px-0">
              <div className="w-full max-w-lg lg:max-w-xl relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder={`Search @username on ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}...`}
                  className={searchInputStyles}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                 {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                        title="Clear search"
                    > <X size={18} /> </button>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleSearch}
                className="ml-3 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 flex items-center"
                disabled={loading}
              >
                {loading ? (
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : ( <Search size={16} className="sm:mr-2" /> )}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 p-3 bg-gray-900 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-800">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                className={`${selectStyles} w-full sm:w-auto`}
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                <option value="instagram">Instagram</option>
                <option value="x" disabled>X (Twitter)</option>
                <option value="youtube" disabled>YouTube</option>
              </select>
              {results.length > 0 && (
                <select
                  className={`${selectStyles} w-full sm:w-auto`}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  title="Sort posts"
                >
                  <option value="default">Sort: Default</option>
                  <option value="likes_desc">Likes (High to Low)</option>
                  <option value="likes_asc">Likes (Low to High)</option>
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className={iconButtonStyles} title="Filters (Coming Soon)" disabled> <Filter size={18} /> </button>
              <button className={iconButtonStyles} title="Export (Coming Soon)" disabled> <Download size={18} /> </button>
              <div className="flex rounded-lg overflow-hidden border border-gray-700" title="View mode">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'} transition-colors`} title="Grid View"> <Grid size={18} /> </button>
                <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'} border-l border-gray-700 transition-colors`} title="Table View"> <List size={18} /> </button>
              </div>
            </div>
          </div>

          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 text-sm shadow-md flex items-center"> <Info size={20} className="mr-3 flex-shrink-0 text-red-400" /> {error}</div>}
          {loading && <div className="flex flex-col justify-center items-center text-center py-20"> <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="text-xl font-semibold text-gray-400">Searching for posts...</p><p className="text-sm text-gray-500">This might take a moment.</p></div>}
          {!loading && !error && results.length === 0 && ( searchQuery.trim() ? ( <div className="text-center text-gray-500 mt-10 py-16 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50"> <Search size={56} className="mx-auto mb-6 text-gray-700" /><p className="font-semibold text-2xl text-gray-400 mb-2">No Posts Found</p><p className="max-w-md mx-auto">Could not find posts for "<span className="font-medium text-gray-300">{searchQuery}</span>". Check username or try another.</p></div>) : ( <div className="text-center text-gray-600 mt-10 py-16 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50"> <Send size={56} className="mx-auto mb-6 text-gray-700 transform -rotate-12" /><p className="font-semibold text-2xl text-gray-400 mb-2">Explore Viral Content</p><p className="max-w-md mx-auto">Enter a profile username to discover their posts.</p><p className="text-xs text-gray-700 mt-4">Currently supporting Instagram.</p></div>))}

          {results.length > 0 && (
            <div className={`mt-1 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'space-y-4'}`}>
              {filteredAndSortedResults.map((post) => (
                <div
                  key={post.postUrl}
                  className="bg-gray-800/70 rounded-xl shadow-xl overflow-hidden border border-gray-700/80 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:border-gray-600 hover:bg-gray-800 cursor-pointer"
                  onClick={() => openPostModal(post)} // Open modal on card click
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="w-full aspect-square sm:aspect-video flex items-center justify-center bg-gray-700/50 overflow-hidden relative">
                        <MicrolinkEmbed url={post.postUrl} isTableView={false} />
                        {/* Removed the small 'Send' icon from here, as the whole card is clickable */}
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                        <p className="text-gray-300 text-xs mb-2.5 line-clamp-2 flex-grow min-h-[36px]">{post.caption || "No caption."}</p>
                        <div className="flex items-center space-x-2 text-2xs text-gray-500 mb-2.5"> <PlatformIcon platform={post.platform} size={12} className="text-gray-600"/> <span>@{post.username}</span></div>
                        <div className="text-gray-400 text-xs flex items-center mb-3 space-x-3"> <span className="flex items-center"><Heart size={14} className="mr-1 text-red-600/90" /> {post.likes.toLocaleString()}</span> <span className="flex items-center"><MessageCircle size={14} className="mr-1 text-sky-500/90" /> {post.comments.toLocaleString()}</span></div>
                        <div className="mt-auto pt-3 border-t border-gray-700/60"> <button className="w-full py-2 px-3 bg-blue-600/80 text-white text-xs font-semibold rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800">Add to Library</button></div>
                      </div>
                    </>
                  ) : ( // Table View
                    <div className="flex items-center p-3 border border-gray-700/80 rounded-lg hover:bg-gray-750/70 transition-colors duration-150" onClick={() => openPostModal(post)}>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mr-3 flex-shrink-0 rounded-md overflow-hidden bg-gray-700/50"> <MicrolinkEmbed url={post.postUrl} isTableView={true} /></div>
                      <div className="flex-1 min-w-0"> <p className="text-gray-100 font-medium text-sm line-clamp-1 mb-0.5">{post.caption || 'No caption'}</p> <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-1"> <PlatformIcon platform={post.platform} size={12} className="text-gray-600"/> <span>@{post.username}</span></div> <div className="text-gray-400 text-2xs flex items-center space-x-2.5"> <span className="flex items-center"><Heart size={12} className="mr-0.5 text-red-600/80" /> {post.likes.toLocaleString()}</span> <span className="flex items-center"><MessageCircle size={12} className="mr-0.5 text-sky-500/80" /> {post.comments.toLocaleString()}</span></div></div>
                      <div className="ml-3 flex-shrink-0"> <button className="py-1.5 px-2.5 bg-blue-600/80 text-white text-2xs font-semibold rounded-md hover:bg-blue-600 transition-colors">Add</button></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      {isModalOpen && selectedPost && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8"
          onClick={closePostModal} // Close on backdrop click
        >
          <div
            className="bg-gray-800 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] border border-gray-700"
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside modal content
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <PlatformIcon platform={selectedPost.platform} size={20} className="text-gray-400"/>
                <span className="text-sm font-medium text-gray-300">@{selectedPost.username}</span>
              </div>
              <button
                onClick={closePostModal}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-700 hover:text-gray-200 transition-colors"
                title="Close"
              > <X size={20} /> </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Microlink Embed in Modal */}
              <div className="w-full p-1 sm:p-2 bg-gray-700/30"> {/* Slight padding around embed */}
                {/* Container for Microlink, let it take width, height will be auto or determined by Microlink's 'large' size */}
                <MicrolinkEmbed url={selectedPost.postUrl} isTableView={false} />
              </div>

              {/* Post Details in Modal */}
              <div className="p-4 sm:p-5 space-y-3">
                <div>
                  <h3 className="text-xs text-gray-500 mb-1">Caption</h3>
                  <p className="text-gray-200 text-sm whitespace-pre-wrap break-words"> {/* Allow full caption to wrap */}
                    {selectedPost.caption || "No caption available."}
                  </p>
                </div>

                <div className="flex items-center justify-start space-x-5 pt-2 border-t border-gray-700/60">
                  <span className="flex items-center text-sm text-gray-400"><Heart size={16} className="mr-1.5 text-red-500" /> {selectedPost.likes.toLocaleString()} Likes</span>
                  <span className="flex items-center text-sm text-gray-400"><MessageCircle size={16} className="mr-1.5 text-sky-400" /> {selectedPost.comments.toLocaleString()} Comments</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-gray-700 flex items-center justify-end space-x-3 bg-gray-800/50 rounded-b-xl">
              <a
                href={selectedPost.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 hover:text-white transition-colors flex items-center"
              >
                <ExternalLink size={14} className="mr-1.5" /> Open Original
              </a>
              <button className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                Add to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
