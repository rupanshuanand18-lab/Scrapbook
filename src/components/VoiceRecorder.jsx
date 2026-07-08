import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";

export default function VoiceRecorder() {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [voiceCard, setVoiceCard] = useState(false);

  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);

        setAudioUrl(url);
        setVoiceCard(true);

        stream.getTracks().forEach((track) => track.stop());

        console.log("Voice Saved");
      };

      recorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  }

  function stopVoiceRecording() {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }

  function deleteVoice() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl("");
    setVoiceCard(false);
  }

  return (
    <>
      {/* Recording Badge */}

      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-36 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-white"
        >
          🔴 Recording...
        </motion.div>
      )}

      {/* Mic Button */}

      <motion.button
        onMouseDown={startVoiceRecording}
        onMouseUp={stopVoiceRecording}
        onTouchStart={startVoiceRecording}
        onTouchEnd={stopVoiceRecording}
        animate={{
          scale: isRecording ? 1.2 : 1,
          color: isRecording ? "#ef4444" : "#ffffff",
        }}
        className="text-white"
      >
        <Mic size={34} />
      </motion.button>

      {/* Voice Card */}

      {voiceCard && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-40 left-1/2 w-80 -translate-x-1/2 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">🎙 Voice Memory</h2>

              <p className="text-sm text-white/70">
                Just Now
              </p>
            </div>

            <button
              onClick={deleteVoice}
              className="text-red-400"
            >
              🗑
            </button>
          </div>

          <audio
            controls
            src={audioUrl}
            className="w-full"
          />
        </motion.div>
      )}
    </>
  );
}