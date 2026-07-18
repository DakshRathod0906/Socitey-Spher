import { Bell, Calendar, ChevronRight } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Card, Badge } from "../../components/ui";

const MOCK_NOTICES = [
  { id: 1, title: "Annual General Meeting 2024", date: "Today, 09:00 AM", content: "Dear Residents, the AGM for 2024 is scheduled for this Sunday at the clubhouse. Please find the agenda attached.", isNew: true },
  { id: 2, title: "Water Supply Interruption", date: "Yesterday, 04:30 PM", content: "Due to overhead tank cleaning, water supply will be interrupted between 10 AM and 2 PM tomorrow. Kindly store adequate water.", isNew: true },
  { id: 3, title: "Diwali Celebration Guidelines", date: "15 Oct 2023", content: "As Diwali approaches, we request all residents to burst crackers only in the designated open ground area behind Block C to ensure safety and minimize noise pollution near the towers.", isNew: false },
];

export default function NoticesView() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Society Notices" 
        subtitle="Stay updated with announcements and alerts from the management."
      />

      <div className="max-w-4xl mx-auto space-y-4">
        {MOCK_NOTICES.map((notice) => (
          <Card key={notice.id} className="p-0 overflow-hidden hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="p-5 flex gap-4">
              <div className="shrink-0 mt-1">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${notice.isNew ? 'bg-primary-light text-primary' : 'bg-secondary-light text-muted'}`}>
                  <Bell className="h-5 w-5" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`text-lg font-semibold ${notice.isNew ? 'text-text' : 'text-muted'}`}>
                    {notice.title}
                  </h3>
                  {notice.isNew && <Badge variant="primary" size="sm">New</Badge>}
                </div>
                
                <div className="flex items-center text-xs text-muted mb-3">
                  <Calendar className="h-3 w-3 mr-1" />
                  {notice.date}
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
        ))}
      </div>
    </div>
  );
}
