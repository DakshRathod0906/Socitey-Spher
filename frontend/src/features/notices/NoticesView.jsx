import { useState } from "react";
import { Bell, Calendar, ChevronRight, Pin } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Card, Badge, Button } from "../../components/ui";
import { useNotices } from "./hooks/useNotices";
import ViewNoticeModal from "./components/ViewNoticeModal";
import { format } from "date-fns";

export default function NoticesView() {
  const { data: notices = [], isLoading } = useNotices({ archived: false });
  const [selectedNotice, setSelectedNotice] = useState(null);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Society Notices" 
        subtitle="Stay updated with announcements and alerts from the management."
      />

      <div className="max-w-4xl mx-auto space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted animate-pulse">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-border/50 rounded-xl">
            <div className="h-12 w-12 rounded-full bg-secondary text-muted flex items-center justify-center mx-auto mb-3">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-text">No active notices</h3>
            <p className="text-muted text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          notices.map((notice) => {
            const isNew = new Date(notice.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // Created in last 3 days
            
            return (
              <Card 
                key={notice._id} 
                className={`p-0 overflow-hidden hover:border-primary/40 transition-colors cursor-pointer group ${notice.isPinned ? "border-primary/30 shadow-sm" : ""}`}
                onClick={() => setSelectedNotice(notice)}
              >
                <div className="p-5 flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${notice.isPinned ? 'bg-primary-light text-primary' : isNew ? 'bg-secondary text-text' : 'bg-surface-light text-muted border border-border/50'}`}>
                      {notice.isPinned ? <Pin className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <h3 className={`text-lg font-semibold truncate ${notice.isPinned || isNew ? 'text-text' : 'text-muted'}`}>
                        {notice.title}
                      </h3>
                      <div className="shrink-0 flex gap-2">
                        {notice.isPinned && <Badge variant="primary" size="sm">Pinned</Badge>}
                        {isNew && !notice.isPinned && <Badge variant="success" size="sm">New</Badge>}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(notice.publishDate || notice.createdAt), "MMM d, yyyy h:mm a")}
                      </div>
                      <Badge variant="outline" size="sm">{notice.category}</Badge>
                    </div>
                    
                    <p className="text-sm text-text/80 leading-relaxed line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center pl-4 text-muted group-hover:text-primary transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <ViewNoticeModal
        open={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        notice={selectedNotice}
      />
    </div>
  );
}
