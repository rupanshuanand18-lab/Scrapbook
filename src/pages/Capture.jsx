import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import TopBar from "../components/TopBar";
import Photo from "../components/Photo";
import PolaroidStack from "../components/PolaroidStack";
import AddMemoryModal from "../components/AddMemoryModal";
import CreateBookModal from "../components/CreateBookModal";
import { useApp } from "../context/AppContext";

export default function Capture() {
  const navigate = useNavigate();
  const { books, addBook, addMemory } = useApp();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cameraFacing, setCameraFacing] = useState("environment");

  const [photos, setPhotos] = useState([]);
  const [flash, setFlash] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  // Enlarged preview & Modals flow
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedCaptureImage, setSelectedCaptureImage] = useState(null);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [showCreateBookModal, setShowCreateBookModal] = useState(false); // <-- State for Create Book Modal

  // ---------- Camera functions ----------
  const stopCamera = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setLoading(true);
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: cameraFacing },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Unable to open camera.");
    }
  }, [cameraFacing, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  function flipCamera() {
    setCameraFacing((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  }

  function showSuccess(message) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 2000);
  }

  // ---------- Handlers for enlarged photo & book flow ----------
  const handlePhotoClick = (photo) => {
    setEnlargedPhoto(photo);
  };

  const closeEnlarged = () => {
    setEnlargedPhoto(null);
    setShowBookSelector(false);
    setSelectedBookId(null);
  };

  const handleAddToBook = () => {
    setShowBookSelector(true);
  };

  const handleOpenCreateBookModal = () => {
    setShowBookSelector(false); // Close book selector popup
    setShowCreateBookModal(true); // Open CreateBookModal
  };

  const handleBookSelect = (bookId) => {
    const nextSelectedImage = enlargedPhoto?.image ?? null;
    setSelectedCaptureImage(nextSelectedImage);
    setSelectedBookId(bookId);
    setShowBookSelector(false);
    setShowAddMemory(true);
    setEnlargedPhoto(null); // close enlarged overlay after preserving the image
  };

  const handleMemorySave = (memory) => {
    addMemory(memory);
    showSuccess("Memory preserved ✨");
    setShowAddMemory(false);
    setSelectedBookId(null);
    setSelectedCaptureImage(null);
  };

  const handleMemoryCancel = () => {
    setShowAddMemory(false);
    setSelectedBookId(null);
    setSelectedCaptureImage(null);
  };

  const handleBookCreatedSuccessfully = (newBook) => {
    const createdBook = addBook(newBook);

    if (selectedCaptureImage) {
      addMemory({
        bookId: createdBook.id,
        title: "Captured moment",
        date: new Date().toISOString().split("T")[0],
        mood: "happy",
        description: "Added from the camera capture.",
        images: [selectedCaptureImage],
      });
    }

    showSuccess("New book created with your photo! ✨");
    setShowCreateBookModal(false);
    setEnlargedPhoto(null);
    setSelectedCaptureImage(null);
  };

  // ---------- Render ----------
  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera video */}
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      <TopBar navigate={navigate} flipCamera={flipCamera} />

      {/* Capture button */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center">
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
      </div>

      {/* Polaroid stack – clickable */}
      <PolaroidStack photos={photos} onPhotoClick={handlePhotoClick} />

      {/* Loading / Error / Success */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Opening Camera...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500">
          {error}
        </div>
      )}
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

      {/* Enlarged Photo Overlay */}
      <AnimatePresence>
        {enlargedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={closeEnlarged}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white rounded-2xl p-4 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={enlargedPhoto.image}
                alt="Captured moment"
                className="w-full aspect-square object-cover rounded-xl"
              />
              <div className="mt-4 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={closeEnlarged}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={handleAddToBook}
                  className="px-5 py-2 bg-pink-500 text-white text-sm font-semibold rounded-full hover:bg-pink-600 transition"
                >
                  Add to Book
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Selector Popup */}
      <AnimatePresence>
        {showBookSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowBookSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-ink mb-4">Choose a Book</h3>
              <ul className="space-y-2 mb-6">
                {books.map((book) => (
                  <li key={book.id}>
                    <button
                      onClick={() => handleBookSelect(book.id)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-beige hover:bg-pink-50 transition"
                    >
                      {book.title}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Footer buttons: Cancel on left, New Book on right */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => setShowBookSelector(false)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOpenCreateBookModal}
                  className="px-4 py-2 bg-pink-500 text-white text-sm font-semibold rounded-full hover:bg-pink-600 transition shadow-sm"
                >
                  + New Book
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AddMemoryModal with pre-filled image */}
      {showAddMemory && selectedBookId && (
        <AddMemoryModal
          isOpen={showAddMemory}
          onClose={handleMemoryCancel}
          onSave={handleMemorySave}
          bookId={selectedBookId}
          initialImages={selectedCaptureImage ? [selectedCaptureImage] : []}
        />
      )}

      {/* CreateBookModal with pre-filled image */}
      {showCreateBookModal && (
        <CreateBookModal
          isOpen={showCreateBookModal}
          onClose={() => setShowCreateBookModal(false)}
          onCreate={handleBookCreatedSuccessfully}
        />
      )}
    </div>
  );
}