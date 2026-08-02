import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import TopBar from "../components/TopBar";
import Photo from "../components/Photo";
import PolaroidStack from "../components/PolaroidStack";
import CreateBookModal from "../components/CreateBookModal";
import Button from "../components/ui/Button";
import { useApp } from "../context/AppContext";

export default function Capture() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books, addBook, addMemory } = useApp();
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cameraFacing, setCameraFacing] = useState("environment");

  const [photos, setPhotos] = useState([]);
  const [flash, setFlash] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  
  // Get the onCaptureComplete callback from navigation state
  const onCaptureComplete = location.state?.onCaptureComplete;
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedPhotoForUpload, setSelectedPhotoForUpload] = useState(null);

  const stopCamera = useCallback(() => {
    if (!streamRef.current) return;

    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
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

    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);
  }
  
  // Handle photo capture with option to upload to book
  function handleCapture(image) {
    const newPhoto = {
      id: crypto.randomUUID(),
      image,
      date: "Just Now",
    };
    
    setPhotos((prev) => {
      const updated = [newPhoto, ...prev];
      return updated.slice(0, 2);
    });
    
    // If there's an onCaptureComplete callback, call it with the image
    if (onCaptureComplete) {
      onCaptureComplete([image]);
      showSuccess("Photo added! Now let's save it to a book.");
      setSelectedPhotoForUpload(image);
      setShowBookModal(true);
    } else {
      showSuccess("Photo captured!");
    }
  }
  
  // Handle creating a new book and adding the captured photo as a memory
  const handleCreateBookAndAddMemory = (bookData) => {
    const newBook = addBook(bookData);
    
    if (selectedPhotoForUpload && newBook) {
      addMemory({
        bookId: newBook.id,
        title: "Captured Moment",
        date: new Date().toISOString().split('T')[0],
        mood: "happy",
        description: "",
        images: [selectedPhotoForUpload],
      });
      showSuccess("Memory saved to new book!");
    }
    
    setShowBookModal(false);
    navigate(`/books/${newBook.id}`);
  };
  
  // Handle adding memory to existing book
  const handleAddToExistingBook = (bookId) => {
    if (selectedPhotoForUpload) {
      addMemory({
        bookId,
        title: "Captured Moment",
        date: new Date().toISOString().split('T')[0],
        mood: "happy",
        description: "",
        images: [selectedPhotoForUpload],
      });
      showSuccess("Memory saved to book!");
    }
    
    setShowBookModal(false);
    navigate(`/books/${bookId}`);
  };

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

      {/* Bottom Controls - Only Photo Button */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center">
        <Photo
          videoRef={videoRef}
          flash={flash}
          setFlash={setFlash}
          setCapture={handleCapture}
        />
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

      {/* Book Selection Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="scrapbook-card rounded-[24px] p-8 max-w-md w-full bg-paper shadow-2xl"
          >
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl font-semibold text-ink mb-2">Save Your Memory</h3>
              <p className="text-ink-muted text-sm">
                Choose an existing book or create a new one for this captured moment.
              </p>
            </div>
            
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {books.length > 0 ? (
                books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleAddToExistingBook(book.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-beige/40 hover:border-pink-accent/50 hover:bg-soft-pink/10 transition-all text-left"
                  >
                    <img src={book.coverImage} alt="" className="w-10 h-14 object-cover rounded-r-md rounded-l-sm" />
                    <div>
                      <p className="font-display font-semibold text-ink text-sm">{book.title}</p>
                      <p className="text-[10px] text-ink-muted uppercase tracking-wider">{book.memoryCount} memories</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-ink-muted text-sm text-center py-4">No books yet. Create a new one!</p>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <Button onClick={() => setShowBookModal(false)} variant="secondary" size="sm">
                Cancel
              </Button>
              <CreateBookModal
                isOpen={true}
                onClose={() => setShowBookModal(false)}
                onSave={handleCreateBookAndAddMemory}
              />
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}