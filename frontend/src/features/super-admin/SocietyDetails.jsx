import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building, MapPin, Mail, Phone, Calendar, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "../../components/shared";
import { Badge, Button, Card } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useSocietyDetails, useManageSociety } from "./hooks/usePlatform";

export default function SocietyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: society, isLoading, isError } = useSocietyDetails(id);
  const { approve, reject, suspend, reactivate } = useManageSociety();

  if (isLoading) return <LoadingScreen message="Loading society details..." />;
  if (isError || !society) {
    return (
      <div className="p-8 text-center text-danger">
        <p>Failed to load society details.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/super-admin")}>Back to Dashboard</Button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case "ACTIVE": return <Badge variant="success">Active</Badge>;
      case "SUBMITTED": return <Badge variant="warning">Submitted</Badge>;
      case "UNDER_REVIEW": return <Badge variant="warning">Under Review</Badge>;
      case "APPROVED": return <Badge variant="success">Approved</Badge>;
      case "REJECTED": return <Badge variant="danger">Rejected</Badge>;
      case "SUSPENDED": return <Badge variant="danger">Suspended</Badge>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/super-admin")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <PageHeader 
        title={society.name}
        subtitle="Society Application Details"
        actions={
          <div className="flex gap-2">
            {(society.status === "SUBMITTED" || society.status === "UNDER_REVIEW") && (
              <>
                <Button 
                  variant="outline" 
                  className="text-danger border-danger hover:bg-danger-light"
                  isLoading={reject.isPending}
                  onClick={() => reject.mutate(society._id)}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
                <Button 
                  isLoading={approve.isPending}
                  onClick={() => approve.mutate(society._id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </Button>
              </>
            )}
            {society.status === "ACTIVE" && (
              <Button 
                variant="outline"
                className="text-danger border-danger hover:bg-danger-light"
                isLoading={suspend.isPending}
                onClick={() => suspend.mutate(society._id)}
              >
                <ShieldAlert className="h-4 w-4 mr-2" /> Suspend Society
              </Button>
            )}
            {society.status === "SUSPENDED" && (
              <Button 
                variant="outline"
                className="text-success border-success hover:bg-success-light"
                isLoading={reactivate.isPending}
                onClick={() => reactivate.mutate(society._id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Reactivate Society
              </Button>
            )}
          </div>
        }
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center border-b border-border pb-3">
            <Building className="h-5 w-5 mr-2 text-primary" /> Society Information
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-muted block mb-1">Registration Code</span>
              <span className="font-medium font-mono bg-secondary-light px-2 py-1 rounded">{society.societyCode}</span>
            </div>
            <div>
              <span className="text-muted block mb-1">Current Status</span>
              {getStatusBadge(society.status)}
            </div>
            <div>
              <span className="text-muted block mb-1">Location</span>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-muted mr-2 mt-0.5 shrink-0" />
                <span className="font-medium">{society.address}, {society.city}, {society.state} - {society.pincode}</span>
              </div>
            </div>
            <div>
              <span className="text-muted block mb-1">Joined Date</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted mr-2" />
                <span className="font-medium">{new Date(society.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center border-b border-border pb-3">
            <ShieldAlert className="h-5 w-5 mr-2 text-primary" /> Setup Progress
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-muted block mb-1">Onboarding Wizard</span>
              {society.setupCompleted ? (
                <Badge variant="success">Completed</Badge>
              ) : (
                <Badge variant="warning">Incomplete</Badge>
              )}
            </div>
            <div className="pt-4 mt-4 border-t border-border/50 text-muted">
              <p>Once active, the Society Admin must complete the Setup Wizard to generate towers, flats, and configure modules.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
