import React from 'react';
import Microlink from '@microlink/react';

interface MicrolinkEmbedProps {
  url: string; // The URL of the content to embed (e.g., Instagram post URL)
  isTableView?: boolean; // To differentiate sizing for table view
}

const MicrolinkEmbed: React.FC<MicrolinkEmbedProps> = ({ url, isTableView = false }) => {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    console.warn('MicrolinkEmbed: Invalid or missing URL:', url);
    return (
      <div className="microlink-embed-container w-full h-full bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-gray-400 p-4 text-center">No valid embed URL provided.</p>
      </div>
    );
  }

  // The 'size' prop still influences the internal layout of the preview card (e.g., text below image, or text beside image)
  const microlinkComponentSize = isTableView ? 'small' : 'large';

  return (
    // This container simply holds the Microlink component. It should allow Microlink
    // to fill its space.
    <div className="microlink-embed-container w-full h-full bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
      <Microlink
        url={url}
        size={microlinkComponentSize}
        media={['image', 'video']} // Prioritize these media types. 'iframe' can be removed if not expecting full embeds.
        // --- REMOVED THE CONFLICTING FIXED HEIGHT ---
        style={{
          width: '100%',
          // height: microlinkComponentHeight, // <--- THIS LINE IS REMOVED
        }}
        // apiKey={process.env.REACT_APP_MICROLINK_API_KEY} // Uncomment if you have a key
      />
    </div>
  );
};

export default MicrolinkEmbed;