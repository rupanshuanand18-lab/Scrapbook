import { motion } from "framer-motion";
import { Mic, X } from "lucide-react";

export default function VoiceMode({
  onClose,
  isRecording,

  stopRecording,
  timer = "00:00",
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 rounded-full bg-white/10 p-3 text-white backdrop-blur"
      >
        <X size={22} />
      </button>

      {/* Title */}
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-10 text-2xl font-semibold text-white"
      >
        Recording Memory
      </motion.h2>

      {/* Animated Microphone */}
      <motion.div
        animate={{
          scale: isRecording ? [1, 1.15, 1] : 1,
        }}
        transition={{
          repeat: isRecording ? Infinity : 0,
          duration: 1,
        }}
        className="flex h-36 w-36 items-center justify-center rounded-full bg-red-500 shadow-2xl"
      >
        <Mic size={70} color="white" />
      </motion.div>

      {/* Timer */}
      <motion.p
        className="mt-10 text-4xl font-bold tracking-widest text-white"
      >
        {timer}
      </motion.p>

      {/* Fake Waveform */}
      <div className="mt-8 flex items-end gap-2 h-12">
        {[16, 28, 40, 24, 36, 18, 30].map((height, index) => (
          <motion.div
            key={index}
            animate={{
              height: isRecording
                ? [height, height + 12, height]
                : height,
            }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: index * 0.1,
            }}
            className="w-2 rounded-full bg-red-500"
            style={{ height }}
          />
        ))}
      </div>

      {/* Instructions */}
      <motion.p
        className="mt-10 text-center text-white/80"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
      >
        {isRecording
          ? "Recording... Tap Stop when finished"
          : "Preparing recorder..."}
      </motion.p>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={stopRecording}
        className="mt-12 rounded-full bg-red-600 px-8 py-4 font-semibold text-white shadow-lg"
      >
        Stop Recording
      </motion.button>
    </motion.div>
  );
}