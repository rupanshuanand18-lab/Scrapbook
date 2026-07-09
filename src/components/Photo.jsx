import { motion } from "framer-motion";

export default
  function Photo({
    videoRef,
    flash,
    setFlash,
    setCapture,
  }) {
  function capturePhoto() {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg");

    setFlash(true);

    setTimeout(() => {
      setFlash(false);
    }, 120);

    setCapture(image);
  }

  return (
    <>
      {/* Capture Button */}

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        transition={{
          type: "spring",
          stiffness: 300,
        }}
        onClick={capturePhoto}
        className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur"
      >
        <div className="h-14 w-14 rounded-full bg-white shadow-xl" />
      </motion.button>


    </>
  );
}