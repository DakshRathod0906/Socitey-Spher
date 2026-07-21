import { Modal, Button, Badge } from "../../../components/ui";
import { Calendar, User, Pin } from "lucide-react";
import { format } from "date-fns";

export default function ViewNoticeModal({ open, onClose, notice }) {
  if (!notice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-start gap-2 pr-6">
          {notice.isPinned && <Pin className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
          <span className="font-semibold text-text break-words leading-tight">{notice.title}</span>
        </div>
      }
      description={
        <div className="flex items-center gap-3 mt-2 text-xs text-muted flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(notice.publishDate || notice.createdAt), "PPP p")}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {notice.createdBy?.name || "Admin"}
          </div>
          <Badge variant="outline" size="sm">{notice.category}</Badge>
          <Badge 
            variant={
              notice.priority === "High" ? "danger" 
              : notice.priority === "Medium" ? "warning" 
              : "default"
            } 
            size="sm"
          >
            {notice.priority}
          </Badge>
        </div>
      }
      footer={
        <Button onClick={onClose} className="w-full sm:w-auto">
          Close
        </Button>
      }
    >
      <div className="mt-4 p-4 bg-surface-light rounded-xl border border-border/50 text-sm text-text/90 whitespace-pre-wrap leading-relaxed animate-fade-in">
        {notice.content}
      </div>
      
      {notice.audience && notice.audience.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted">
          <span className="font-medium">Target Audience:</span>
          {notice.audience.includes("all") ? (
            <Badge variant="outline" size="sm">All Residents</Badge>
          ) : (
            notice.audience.map(a => (
              <Badge key={a} variant="outline" size="sm" className="capitalize">
                {a.replace("_", " ")}
              </Badge>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}
