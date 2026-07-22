import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-[#FAF8F5] px-6 py-12 md:p-16 lg:p-24 overflow-hidden select-none">
      
      {/* --- SUBTLE BACKGROUND DEPTH --- */}
      <div className="absolute top-[-10%] left-[-10%] h-[50rem] w-[50rem] rounded-full bg-[#F3E8EE]/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50rem] w-[50rem] rounded-full bg-[#E8EFF0]/50 blur-3xl pointer-events-none" />

      {/* --- TOP: MINIMALIST OVERVIEW --- */}
      <div className="w-full z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-sans text-xs sm:text-sm font-light tracking-[0.3em] text-stone-400 uppercase"
        >
          An Open Canvas / For Your Journey
        </motion.p>
      </div>

      {/* --- CENTER: HERO TYPOGRAPHY (80% SCREEN WIDTH ON DESKTOP) --- */}
      <div className="w-full max-w-[90%] md:max-w-[85%] lg:max-w-[80%] mx-auto my-auto z-10 space-y-6 md:space-y-10">
        
        {/* Massive Brand Heading */}
        <div className="overflow-hidden py-2">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-extralight tracking-tight text-stone-900 text-left
              text-6xl 
              sm:text-8xl 
              md:text-[10vw] 
              leading-[0.95]"
          >
            Scrapbook.
          </motion.h1>
        </div>

        {/* Cinematic, High-Readability Statement */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="font-sans font-light text-stone-600 text-left tracking-wide max-w-4xl
            text-lg 
            sm:text-2xl 
            md:text-[2.5vw] 
            leading-relaxed sm:leading-relaxed md:leading-snug"
        >
          Every beautiful journey begins with a single, simple memory. A quiet space designed to stitch your stories together.
        </motion.p>

      </div>

      {/* --- BOTTOM: MASSIVE INTERACTIVE CLICK TARGET --- */}
      <div className="w-full z-10 flex justify-between items-end border-t border-stone-200/70 pt-8 mt-6">
        
        {/* Subtle decorative mark */}
        <span className="hidden sm:inline font-serif text-stone-300 text-2xl">✦</span>

        {/* High-Contrast, Large Action Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ x: 6 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate("/capture")}
          className="group flex items-center justify-between gap-12 bg-transparent text-stone-900 border-none outline-none py-2 text-left"
        >
          <span className="font-sans text-xl sm:text-2xl md:text-[2vw] font-medium tracking-wider uppercase">
            Begin Your Story
          </span>
          <span className="font-serif text-3xl sm:text-4xl md:text-[3vw] transition-transform duration-300 group-hover:translate-x-3 text-stone-400 group-hover:text-stone-900">
            →
          </span>
        </motion.button>

      </div>

    </div>
  );
}