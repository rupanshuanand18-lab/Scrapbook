import { motion } from "framer-motion";

export default function Preview({ captured }) {
  if (!captured) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.4,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.3,
      }}
      className="absolute right-5 top-24 h-24 w-20 overflow-hidden rounded-xl border-2 border-white shadow-2xl"
    >
      <img
        src={captured}
        alt="Captured"
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}