import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UrlInput } from "./components/UrlInput";
import { TranscriptView } from "./components/TranscriptView";
import { createJob, getJobResult } from "./lib/api";
import { type JobResponse } from "./types/ytsubtitle";
import { FaBolt } from "react-icons/fa";
import { connectWs } from "./lib/ws";
import { AiOutlineCheck, AiOutlineLoading3Quarters } from "react-icons/ai";
import Turnstile from "./lib/Turnstile";
import { useQuery } from "@tanstack/react-query";

type JobStatus = "queue" | "started" | "completed";

const steps: JobStatus[] = ["queue", "started", "completed"];
export type OnProgressType = {
  jobId: string;
  status: JobStatus;
  videoId: string;
};

function getVideoId(url: string) {
  const regex =
    /(?:youtube\.com\/(?:.*v=|v\/|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : "";
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [videoId, setVideoId] = useState("");

  const { data, refetch } = useQuery<JobResponse>({
    queryKey: ["transcript", videoId],
    queryFn: ({ queryKey }) => {
      const [, vId] = queryKey as [string, string];
      return getJobResult(vId);
    },
    staleTime: Infinity,
    enabled: false,
  });
  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        alert("Verify you are human");
        return;
      }
      const vId = getVideoId(url);
      if (!vId) return setError("Provide valid youtube url.");
      setVideoId(vId);
      setStatus("queue");
      const result = await createJob(url, token);

      setJobId(result.jobId);
    } catch (err: any) {
      console.error(err);
      setError(
        "Failed to fetch transcript. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
      window.turnstile.reset();
    }
  };

  const onProgress = async (message: string) => {
    const { status } = JSON.parse(message) as OnProgressType;
    setStatus(status);
    if (status !== "completed") return;
    refetch();
    setStatus(null);
  };

  useEffect(() => {
    if (!jobId) return;
    const socket = connectWs();

    const onConnect = () => {
      console.log(`Ws connected,id: ${socket.id}`);
      socket.emit("join", jobId);
      socket.on("progress", onProgress);
    };
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("progress", onProgress);
      socket.disconnect();
    };
  }, [jobId]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-x-hidden selection:bg-red-500/30 selection:text-red-200">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-red-900/20 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-blue-900/20 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider uppercase">
            <FaBolt className="text-[10px]" /> Powered by n8n + AI
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-gray-200 to-gray-500">
            YTSubtitle
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Extract transcripts from any YouTube video instantly. No ads, just
            text.
          </p>
        </motion.div>

        {/* Input Section */}
        <UrlInput onSubmit={handleUrlSubmit} isLoading={loading} />
        <Turnstile
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
          onVerify={setToken}
        />
        {/* Loading Line */}
        <AnimatePresence mode="wait">
          {status && <StatusProgress status={status} />}
        </AnimatePresence>
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 text-red-400 bg-red-900/10 border border-red-900/20 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {data && <TranscriptView data={data} key={data.videoId} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function StatusProgress({ status }: { status: JobStatus }) {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = status === step;
          const isDone = steps.indexOf(status) > index;

          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center w-full"
            >
              {/* Circle */}
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full border transition-all
                  ${
                    isDone
                      ? "bg-green-500 border-green-500 text-white"
                      : isActive
                      ? "border-blue-500 text-blue-500"
                      : "border-gray-300 text-gray-400"
                  }
                `}
              >
                {isDone ? (
                  <AiOutlineCheck />
                ) : isActive ? (
                  <AiOutlineLoading3Quarters className="animate-spin" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Label */}
              <span className="mt-2 text-xs capitalize text-gray-500">
                {step}
              </span>

              {/* Line */}
              {index < steps.length && (
                <div
                  className={`h-0.5 w-full mt-2
                    ${isDone ? "bg-green-500" : "bg-gray-300"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
