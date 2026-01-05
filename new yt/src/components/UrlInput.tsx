import React, { useState } from "react";
import { motion } from "motion/react";
import { FaYoutube, FaSearch } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl relative group mb-10"
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FaYoutube className="text-red-500 text-2xl" />
      </div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube URL here..."
        disabled={isLoading}
        className={twMerge(
          "w-full py-4 pl-12 pr-12 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 backdrop-blur-sm shadow-lg",
          "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      />
      <button
        type="submit"
        disabled={isLoading || !url.trim()}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaSearch className="text-xl" />
        )}
      </button>

      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-linear-to-r from-red-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-60 -z-10"></div>
    </motion.form>
  );
};
