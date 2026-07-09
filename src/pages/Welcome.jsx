import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 to-sky-100">

      {/* Decorative Blobs */}
      <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-yellow-200/20 blur-3xl" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 w-[90%] max-w-xl rounded-[40px] border border-white/40 bg-white/25 p-10 text-center shadow-2xl backdrop-blur-xl"
      >
        {/* Small Heading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-xs uppercase tracking-[0.5em] text-gray-600"
        >
          WELCOME TO
        </motion.p>

        {/* Brand */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="font-serif text-6xl text-gray-800"
        >
          Scrapbook
        </motion.h1>

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mx-auto mt-8 max-w-sm text-lg leading-8 text-gray-600"
        >
          Every beautiful journey begins with a single memory.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "80px" }}
          transition={{ delay: 1 }}
          className="mx-auto my-8 h-px bg-gray-400"
        />

        {/* Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.97,
          }}
          onClick={() => navigate("/capture")}
          className="rounded-full bg-white px-10 py-4 text-lg font-medium text-gray-700 shadow-lg transition hover:shadow-2xl"
        >
          Begin Your Story →
        </motion.button>
      </motion.div>
    </div>
  );
}