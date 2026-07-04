import { X, RefreshCcw } from "lucide-react";

export default function TopBar({
  navigate,
  flipCamera,
}) {
  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6">

      {/* Exit */}

      <button
        onClick={() => navigate("/dashboard")}
        className="rounded-full bg-black/40 p-3 text-white backdrop-blur"
      >
        <X size={24} />
      </button>

      {/* Date */}

      <span className="font-medium text-white">
        {new Date().toLocaleDateString()}
      </span>

      {/* Flip */}

      <button
        onClick={flipCamera}
        className="rounded-full bg-black/40 p-3 text-white backdrop-blur"
      >
        <RefreshCcw size={20} />
      </button>

    </div>
  );
}