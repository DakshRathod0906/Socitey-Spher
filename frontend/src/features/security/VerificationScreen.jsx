import { useState } from "react";
import { CheckCircle, XCircle, ArrowLeft, User, MapPin, Clock, Shield } from "lucide-react";
import { Button, Badge } from "../../components/ui";
import { useCheckInVisit } from "./hooks/useSecurityVisits";

export default function VerificationScreen({ visit, onClose }) {
  const [rejectReason, setRejectReason] = useState("");
  
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckInVisit({
    onSuccess: () => {
      onClose();
    }
  });

  const handleAllowEntry = () => {
    checkIn({ 
      visitId: visit._id, 
      gate: "Main Gate" 
    });
  };

  const handleReject = () => {
    // We could call an API to reject if needed, or just close
    // For now, let's just close as the plan just says Reject
    onClose();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto bg-surface overflow-hidden">
      <div className="flex items-center p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          Visitor Verified
          <Badge variant="success" icon={CheckCircle}>Valid</Badge>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Visitor Info */}
        <div className="bg-background p-4 rounded-xl border border-border flex items-start gap-4">
          <div className="bg-primary-light h-14 w-14 rounded-full flex items-center justify-center shrink-0">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">{visit.visitorId?.name}</h2>
            <p className="text-sm text-muted capitalize">{visit.purpose || visit.visitorId?.visitorType?.toLowerCase()}</p>
            {visit.visitorId?.phone && <p className="text-sm text-muted">{visit.visitorId.phone}</p>}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background p-3 rounded-lg border border-border">
            <p className="text-xs text-muted mb-1 flex items-center gap-1">
              <User className="h-3 w-3" /> Visiting
            </p>
            <p className="font-semibold text-sm truncate">{visit.residentUserId?.name}</p>
          </div>
          
          <div className="bg-background p-3 rounded-lg border border-border">
            <p className="text-xs text-muted mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Destination
            </p>
            <p className="font-semibold text-sm">
              Tower {visit.flatId?.towerId?.name || "A"}, Flat {visit.flatId?.flatNumber}
            </p>
          </div>

          <div className="bg-background p-3 rounded-lg border border-border">
            <p className="text-xs text-muted mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expected
            </p>
            <p className="font-semibold text-sm">
              {new Date(visit.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="bg-background p-3 rounded-lg border border-border">
            <p className="text-xs text-muted mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" /> Status
            </p>
            <p className="font-semibold text-sm text-warning">Pending Entry</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-background border-t border-border grid grid-cols-2 gap-3 pb-8">
        <Button 
          variant="outline" 
          className="w-full text-danger border-danger/30 hover:bg-danger-light hover:text-danger"
          onClick={handleReject}
          disabled={isCheckingIn}
        >
          <XCircle className="h-5 w-5 mr-2" />
          Reject Entry
        </Button>
        <Button 
          className="w-full"
          onClick={handleAllowEntry}
          loading={isCheckingIn}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Allow Entry
        </Button>
      </div>
    </div>
  );
}
