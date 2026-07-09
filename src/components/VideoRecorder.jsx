import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Video } from "lucide-react";

export default function VideoRecorder({ streamRef, showSuccess }) {
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);

  async function toggleVideoRecording() {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      videoChunksRef.current = [];

      const recorder = new MediaRecorder(streamRef.current);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, {
          type: "video/webm",
        });

        URL.createObjectURL(blob);

        showSuccess("🎥 Video Saved");
      };

      recorder.start();

      setIsRecording(true);

    } catch (err) {
      showSuccess("❌ Couldn't record video");
      console.error(err);
    }
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isRecording ? 1.15 : 1,
          color: isRecording ? "#ef4444" : "#ffffff",
        }}
        onClick={toggleVideoRecording}
        className="text-white"
      >
        <Video size={32} />
      </motion.button>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-white font-medium"
        >
          🔴 Recording...
        </motion.div>
      )}
    </>
  );
}