import React, { useState } from "react";
import { motion } from "motion/react";
import type { JobResponse } from "../types/ytsubtitle";
import { FaCopy, FaDownload, FaClock, FaUser } from "react-icons/fa";
import { Virtuoso } from "react-virtuoso";

interface TranscriptViewProps {
  data: JobResponse;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ data }) => {
  const { videoInfo, transcripts } = data;
  const [showTimestamps, setShowTimestamps] = useState(true);

  // Prefer default, then auto, then custom
  const transcriptData =
    transcripts.en_auto?.default ||
    transcripts.en_auto?.auto ||
    transcripts.en_auto?.custom ||
    [];

  const handleCopy = () => {
    const text = transcriptData.map((t) => t.text).join(" ");
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const handleDownload = () => {
    const text = transcriptData.map((t) => `[${t.start}] ${t.text}`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${videoInfo.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mt-8 space-y-6 h-[100]"
    >
      {/* Video Info Card */}
      <div className="sticky top-10 bg-gray-800/40 border border-gray-700 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row gap-6 items-start">
        <img
          src={
            videoInfo.thumbnailUrl.maxresdefault ||
            videoInfo.thumbnailUrl.hqdefault
          }
          alt={videoInfo.name}
          className="w-full md:w-64 aspect-video rounded-lg object-cover shadow-lg"
        />
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-bold text-white line-clamp-2">
            {videoInfo.name}
          </h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <FaUser className="text-gray-500" />
              <span>{videoInfo.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaClock className="text-gray-500" />
              <span>{videoInfo.duration}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm line-clamp-3">
            {videoInfo.description}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowTimestamps(!showTimestamps)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            showTimestamps
              ? "bg-gray-700 hover:bg-gray-600 text-white" // Inactive state look (default) or Active? Let's make it look like a toggle.
              : "bg-gray-800 hover:bg-gray-700 text-gray-400"
          }`}
          // Actually, let's make it more distinct. If I use the same style as handleCopy (gray-700), it looks like a standard action.
          // Let's use a conditional class.
        >
          <FaClock
            className={showTimestamps ? "text-red-400" : "text-gray-500"}
          />
          {showTimestamps ? "Hide Time" : "Show Time"}
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors text-sm font-medium"
        >
          <FaCopy /> Copy
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm font-medium"
        >
          <FaDownload /> Download
        </button>
      </div>

      {/* Transcript List */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm h-[600px]">
        {transcriptData.length > 0 ? (
          <Virtuoso
            style={{ height: "100%" }}
            data={transcriptData}
            itemContent={(_, item) => (
              <div className="flex gap-4 group hover:bg-gray-700/30 p-2 rounded-lg transition-colors mb-2">
                {showTimestamps && (
                  <span className="text-red-400 text-xs font-mono font-medium min-w-12 pt-1 select-none">
                    {item.start}
                  </span>
                )}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            )}
          />
        ) : (
          <div className="text-center text-gray-500 py-12">
            No transcript available for this video.
          </div>
        )}
      </div>
    </motion.div>
  );
};
