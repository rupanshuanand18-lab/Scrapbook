import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import TopBar from "../components/TopBar";
import Photo from "../components/Photo";
import VoiceRecorder from "../components/VoiceRecorder";
import VideoRecorder from "../components/VideoRecorder";

import PolaroidStack from "../components/PolaroidStack";

export default function Capture() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cameraFacing, setCameraFacing] = useState("environment");

  const [photos, setPhotos] = useState([]);
  const [flash, setFlash] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");


  useEffect(() => {
    startCamera();

    return () => stopCamera();
  }, [cameraFacing]);

  async function startCamera() {
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: cameraFacing,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setLoading(false);
      setError("");

    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Unable to open camera.");
    }
  }

  function stopCamera() {
    if (!streamRef.current) return;

    streamRef.current.getTracks().forEach((track) => track.stop());
  }

  function flipCamera() {
    setCameraFacing((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  }

  function showSuccess(message) {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  }

  return (
    <div className="fixed inset-0 bg-black">

      {/* Camera */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      />
      {flash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.08 }}
          className="absolute inset-0 z-50 bg-white pointer-events-none"
        />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Top Bar */}
      <TopBar
        navigate={navigate}
        flipCamera={flipCamera}
      />

      {/* Bottom Controls */}
      <div className="absolute bottom-10 left-0 right-0">

        <motion.p
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="mb-5 text-center text-sm text-white/70"
        >
          Hold 🎤 to record • Release to save
        </motion.p>

        <div className="flex items-center justify-center gap-10">

          <VoiceRecorder
            streamRef={streamRef}
            stopCamera={stopCamera}
            startCamera={startCamera}
            showSuccess={showSuccess}
          />

          <Photo
            videoRef={videoRef}
            flash={flash}
            setFlash={setFlash}
            setCapture={(image) => {
              setPhotos((prev) => {
                const updated = [
                  {
                    id: crypto.randomUUID(),
                    image,
                    date: "Just Now",
                  },
                  ...prev,
                ];

                return updated.slice(0, 2);
              });
            }}
          />
          <VideoRecorder
            streamRef={streamRef}
            showSuccess={showSuccess}
          />

        </div>

      </div>

      {/* Photo Preview */}
      <PolaroidStack photos={photos} />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Opening Camera...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500">
          {error}
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-2 text-white shadow-xl"
        >
          {successMessage}
        </motion.div>
      )}

    </div>
  );
}