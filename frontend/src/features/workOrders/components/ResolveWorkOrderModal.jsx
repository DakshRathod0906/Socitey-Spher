import { useState, useRef } from "react";
import { Modal, Button, Textarea, Input } from "../../../components/ui";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResolveWorkOrderModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError("");
    
    if (!file) {
      setPhoto(null);
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      setPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 5MB.");
      setPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPhoto(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError("Resolution notes are required.");
      return;
    }
    if (!photo) {
      setError("A completion photo is required.");
      return;
    }

    const formData = new FormData();
    formData.append("resolutionNotes", resolutionNotes.trim());
    if (partsUsed.trim()) formData.append("partsUsed", partsUsed.trim());
    if (timeSpent.trim()) formData.append("timeSpent", timeSpent.trim());
    formData.append("completionPhotos", photo);

    onSubmit(formData);
  };

  // Reset state when modal closes
  const handleClose = () => {
    setResolutionNotes("");
    setPartsUsed("");
    setTimeSpent("");
    setPhoto(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Resolve Work Order"
      description="Provide details and a photo of the completed job."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="resolutionNotes" className="block text-sm font-medium text-slate-700 mb-1">
            Resolution Notes <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <Textarea
            id="resolutionNotes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Describe the work that was done..."
            rows={3}
            required
            disabled={isSubmitting}
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="completionPhoto" className="block text-sm font-medium text-slate-700 mb-1">
            Completion Photo <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="completionPhoto"
            type="file"
            accept="image/jpeg, image/png, image/webp"
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
            required
            disabled={isSubmitting}
            aria-required="true"
            aria-describedby="photo-hint"
          />
          <p id="photo-hint" className="mt-1 text-xs text-slate-500">
            JPEG, PNG, WebP up to 5MB.
          </p>
        </div>

        <div>
          <label htmlFor="partsUsed" className="block text-sm font-medium text-slate-700 mb-1">
            Parts Used (Optional)
          </label>
          <Input
            id="partsUsed"
            type="text"
            value={partsUsed}
            onChange={(e) => setPartsUsed(e.target.value)}
            placeholder="e.g. 1x Light bulb, 2m Pipe"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="timeSpent" className="block text-sm font-medium text-slate-700 mb-1">
            Time Spent (Optional)
          </label>
          <Input
            id="timeSpent"
            type="text"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            placeholder="e.g. 2 hours"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || !photo || !resolutionNotes.trim()}>
            {isSubmitting ? "Submitting..." : "Submit Resolution"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
