import { useState, useEffect } from "react";
import { Modal, Button, Input, Textarea, Checkbox } from "../../../components/ui";
import { useCreateNotice, useUpdateNotice } from "../hooks/useNotices";

export default function CreateNoticeModal({ open, onClose, initialValues }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Low");
  const [audience, setAudience] = useState(["all"]);
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState("");

  const { mutate: createNotice, isPending: isCreating } = useCreateNotice();
  const { mutate: updateNotice, isPending: isUpdating } = useUpdateNotice();

  const isEditing = !!initialValues;
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setTitle(initialValues.title || "");
        setContent(initialValues.content || "");
        setCategory(initialValues.category || "General");
        setPriority(initialValues.priority || "Low");
        setAudience(initialValues.audience || ["all"]);
        setIsPinned(initialValues.isPinned || false);
      } else {
        setTitle("");
        setContent("");
        setCategory("General");
        setPriority("Low");
        setAudience(["all"]);
        setIsPinned(false);
      }
      setError("");
    }
  }, [open, initialValues]);

  const handleAudienceChange = (value) => {
    if (value === "all") {
      setAudience(["all"]);
      return;
    }
    
    let newAudience = audience.filter((a) => a !== "all");
    if (newAudience.includes(value)) {
      newAudience = newAudience.filter((a) => a !== value);
    } else {
      newAudience.push(value);
    }
    
    if (newAudience.length === 0) newAudience = ["all"];
    setAudience(newAudience);
  };

  const handleSubmit = () => {
    setError("");
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }
    if (!trimmedContent) {
      setError("Content is required.");
      return;
    }
    if (audience.length === 0) {
      setError("Please select at least one audience type.");
      return;
    }

    const payload = {
      title: trimmedTitle,
      content: trimmedContent,
      category,
      priority,
      audience,
      isPinned,
    };

    if (isEditing) {
      updateNotice(
        { id: initialValues._id, ...payload },
        { onSuccess: onClose }
      );
    } else {
      createNotice(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Notice" : "Create New Notice"}
      description={isEditing ? "Update an existing announcement." : "Draft a new announcement."}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isPending} disabled={isPending}>
            {isEditing ? "Update Notice" : "Broadcast Notice"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}
        
        <Input 
          label="Notice Title" 
          placeholder="e.g. Annual General Meeting" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
        <Textarea 
          label="Message Content" 
          placeholder="Write the full announcement here..." 
          rows={5} 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text mb-2 block">Category</label>
            <select
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow disabled:opacity-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isPending}
            >
              <option value="General">General</option>
              <option value="Event">Event</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-text mb-2 block">Priority</label>
            <select
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow disabled:opacity-50"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isPending}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="text-sm font-medium text-text mb-2 block">Target Audience</label>
          <div className="space-y-2">
            <Checkbox 
              label="Send to ALL residents" 
              checked={audience.includes("all")}
              onChange={() => handleAudienceChange("all")}
              disabled={isPending}
            />
            <div className="ml-6 space-y-2">
              <Checkbox 
                label="Owners only" 
                checked={!audience.includes("all") && audience.includes("owner")}
                onChange={() => handleAudienceChange("owner")}
                disabled={isPending || audience.includes("all")}
              />
              <Checkbox 
                label="Tenants only" 
                checked={!audience.includes("all") && audience.includes("tenant")}
                onChange={() => handleAudienceChange("tenant")}
                disabled={isPending || audience.includes("all")}
              />
              <Checkbox 
                label="Staff only" 
                checked={!audience.includes("all") && audience.includes("service_staff")}
                onChange={() => handleAudienceChange("service_staff")}
                disabled={isPending || audience.includes("all")}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border mt-4">
          <Checkbox 
            label="Pin this notice to the top" 
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            disabled={isPending}
          />
        </div>
      </div>
    </Modal>
  );
}
