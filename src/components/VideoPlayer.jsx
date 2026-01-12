import React from 'react';

export default function VideoPlayer({ videoUrl, title }) {
  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <video
        controls
        className="w-full h-auto"
        poster="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=450&fit=crop"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="p-4 bg-gray-900 text-white">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </div>
  );
}