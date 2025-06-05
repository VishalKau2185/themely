// Filename: ExplorePage.tsx (Simplified for Debugging - TEST THIS WITH DEBUG_MODE = 1 in App.tsx)
import React from 'react';
import { Search, Grid, List } from 'lucide-react';

const ExplorePageSimplifiedDebug: React.FC = () => {
  console.log("Rendering ExplorePageSimplifiedDebug");

  return (
    <div className="h-screen w-screen bg-blue-700 p-10 text-white"> {/* Full screen blue background */}
      <h1 className="text-4xl font-bold mb-4 border-b-4 border-yellow-400 pb-2">Tailwind Test Page</h1>

      <p className="mb-6 text-lg bg-pink-500 p-3 rounded-md">
        If you see this pink background, rounded corners, and padding, some Tailwind classes are working.
      </p>

      <div className="mb-6 p-4 bg-green-600 border-4 border-dashed border-red-400">
        <p className="text-xl">Testing Flexbox:</p>
        <div className="mt-2 flex flex-row justify-around items-center bg-purple-700 p-3 h-20"> {/* Explicit flex-row */}
          <div className="bg-orange-500 p-2 rounded">Item 1</div>
          <div className="bg-teal-500 p-2 rounded">Item 2</div>
          <div className="bg-red-500 p-2 rounded">Item 3</div>
        </div>
         <div className="mt-2 flex justify-between items-center bg-gray-700 p-3 h-20"> {/* justify-between test */}
          <div className="bg-orange-500 p-2 rounded">Left</div>
          <div className="bg-teal-500 p-2 rounded">Middle (should be spaced)</div>
          <div className="bg-red-500 p-2 rounded">Right</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 bg-indigo-600 p-4">
        <div className="bg-yellow-300 text-black p-2 rounded">Grid Cell 1</div>
        <div className="bg-yellow-300 text-black p-2 rounded">Grid Cell 2</div>
        <div className="bg-yellow-300 text-black p-2 rounded">Grid Cell 3</div>
      </div>

      <div className="mt-5 p-3 bg-gray-800 rounded-lg">
        <p>Common Input Styles Test:</p>
        <input
            type="text"
            placeholder="Test Input"
            className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500 w-full mt-1"
        />
        <button className="mt-2 p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
            Test Button
        </button>
      </div>
    </div>
  );
};

export default ExplorePageSimplifiedDebug;
