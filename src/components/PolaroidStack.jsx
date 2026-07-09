import { motion, AnimatePresence } from "framer-motion";

export default function PolaroidStack({ photos }) {
  return (
    <div className="absolute right-5 top-24 w-36 h-44 pointer-events-none z-40">

      <AnimatePresence>

        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{
              opacity: 0,
              y: -60,
              scale: 0.6,
              rotate: 0,
            }}
            animate={{
              opacity: 1,
              y: index * 12,
              scale: 1,
              rotate: index === 0 ? -5 : 6,
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
            }}
            transition={{
              duration: 0.45,
            }}
            className="absolute bg-white p-2 rounded-md shadow-2xl"
            style={{
              zIndex: photos.length - index,
            }}
          >
            <img
              src={photo.image}
              alt=""
              className="w-28 h-28 object-cover rounded-sm"
            />

            <p className="mt-2 text-center text-[10px] text-gray-600">
              {photo.date}
            </p>

          </motion.div>
        ))}

      </AnimatePresence>

    </div>
  );
}