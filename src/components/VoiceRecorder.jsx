import { useRef, useState } from "react";
import { Mic } from "lucide-react";
import VoiceMode from "./VoiceMode";

export default function VoiceRecorder({
  stopCamera,
  startCamera,
  showSuccess,
}) {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState("00:00");

  const intervalRef = useRef(null);

  async function startRecording() {
    try {
      stopCamera();
      setVoiceMode(true);
      setIsRecording(true);



      let seconds = 0;

      intervalRef.current = setInterval(() => {
        seconds++;

        const min = String(Math.floor(seconds / 60)).padStart(2, "0");
        const sec = String(seconds % 60).padStart(2, "0");

        setTimer(`${min}:${sec}`);
      }, 1000);

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
        clearInterval(intervalRef.current);

        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });



        stream.getTracks().forEach((track) => track.stop());

        setVoiceMode(false);

        setIsRecording(false);

        setTimer("00:00");

        startCamera();

        showSuccess("🎙 Voice Saved");
      };

      recorder.start();
    } catch (err) {
      console.log(err);
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
  }

  if (voiceMode) {
    return (
      <VoiceMode
        onClose={() => {
          setVoiceMode(false);
          startCamera();
        }}
        isRecording={isRecording}
        timer={timer}

        stopRecording={stopRecording}
      />
    );
  }

  return (
    <button
      onClick={startRecording}
      className="text-white"
    >
      <Mic size={34} />
    </button>
  );
}