import { useState } from "react";
import { QrCode, Plus, UserCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import { PageHeader, DataTable } from "../../components/shared";
import { Button, Modal, Input, Badge, Select } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useVisits, useCreateVisit } from "./hooks/useVisits";

const visitSchema = z.object({
  visitorName: z.string().min(2, "Name is required"),
  visitorPhone: z.string().optional(),
  visitorType: z.enum(["GUEST", "DELIVERY", "SERVICE_PROVIDER"]),
  expectedArrival: z.string().min(1, "Expected arrival is required"),
});

export default function MyVisitors() {
  const [isPreApproveModalOpen, setIsPreApproveModalOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null); // Will hold the returned visit object

  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const { data: visits, meta, isLoading, isError } = useVisits(filters);
  const { mutate: createVisit, isPending: isCreating } = useCreateVisit({
    onSuccess: (data) => {
      setGeneratedPass(data);
      reset();
    }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(visitSchema),
    defaultValues: { visitorType: "GUEST" }
  });

  const onCreatePass = (formData) => {
    // Convert to ISO string and set validUntil dynamically
    const arrival = new Date(formData.expectedArrival);
    const validUntil = new Date(arrival);
    validUntil.setHours(validUntil.getHours() + 24); // Valid for 24 hrs from arrival
    
    createVisit({
      visitorData: {
        name: formData.visitorName,
        phone: formData.visitorPhone,
        visitorType: formData.visitorType
      },
      visitData: {
        expectedArrival: arrival.toISOString(),
        validUntil: validUntil.toISOString()
      }
    });
  };

  const columns = [
    { header: "Visitor Name", accessor: "visitorName", cell: (row) => <span className="font-medium">{row.visitorName}</span> },
    { header: "Expected", accessor: "expectedArrival", cell: (row) => new Date(row.expectedArrival).toLocaleDateString() },
    { header: "Type", accessor: "visitorType", cell: (row) => <span className="capitalize">{row.visitorType.toLowerCase()}</span> },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "CHECKED_OUT": "default",
          "CHECKED_IN": "primary",
          "PENDING": "warning",
          "APPROVED": "success",
          "EXPIRED": "danger"
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status}</Badge>;
      }
    },
    {
      header: "QR Pass",
      accessor: "qr",
      align: "right",
      cell: (row) => row.status === "APPROVED" && row.passCode ? (
        <Button variant="outline" size="sm" onClick={() => {
          setGeneratedPass(row);
          setIsPreApproveModalOpen(true);
        }}>
          <QrCode className="h-4 w-4 mr-1" /> View
        </Button>
      ) : <span className="text-muted text-xs">-</span>
    }
  ];

  if (isLoading) return <LoadingScreen message="Loading visitors..." />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger-light text-danger rounded-xl">
        Failed to load your visitors.
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="My Visitors" 
        subtitle="Manage your expected guests and view past visitor logs."
        actions={
          <Button onClick={() => setIsPreApproveModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Pre-approve Visitor
          </Button>
        }
      />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary to-blue-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <QrCode className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
          <h3 className="text-xl font-bold mb-2">Fast-track Entry</h3>
          <p className="text-primary-light text-sm mb-6 max-w-[80%]">
            Pre-approve your guests to generate a QR code. They can scan it at the gate for instant entry.
          </p>
          <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white border-none" onClick={() => setIsPreApproveModalOpen(true)}>
            Generate New Pass
          </Button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-text mb-4 mt-8">Recent & Upcoming Visitors</h2>
      <DataTable 
        columns={columns}
        data={visits}
        pagination={{
          currentPage: filters.page,
          totalPages: meta?.totalPages || 1,
          onPageChange: (page) => setFilters({ ...filters, page })
        }}
      />

      <Modal 
        open={isPreApproveModalOpen} 
        onClose={() => {
          setIsPreApproveModalOpen(false);
          setTimeout(() => setGeneratedPass(null), 200);
        }}
        title={generatedPass ? "Pass Generated!" : "Pre-approve Visitor"}
        description={generatedPass ? "Share this QR code with your visitor." : "Enter visitor details to generate a gate pass."}
      >
        {!generatedPass ? (
          <form className="space-y-4" onSubmit={handleSubmit(onCreatePass)}>
            <Input label="Visitor Name" placeholder="e.g. Rahul Kumar" error={errors.visitorName?.message} {...register("visitorName")} />
            <Input label="Phone Number (Optional)" placeholder="+91" type="tel" {...register("visitorPhone")} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Select 
                  label="Visitor Type"
                  options={[
                    { value: "GUEST", label: "Guest / Relative" },
                    { value: "DELIVERY", label: "Delivery" },
                    { value: "SERVICE_PROVIDER", label: "Service Provider" }
                  ]}
                  {...register("visitorType")}
                />
              </div>
              <Input label="Expected Date" type="date" error={errors.expectedArrival?.message} {...register("expectedArrival")} />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsPreApproveModalOpen(false)}>Cancel</Button>
              <Button loading={isCreating} type="submit">Generate QR Pass</Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center py-6 text-center animate-fade-in">
            <div className="bg-white p-4 rounded-xl border border-border shadow-sm mb-4 inline-block">
              {/* Secure Versioned QR Code using rawToken or fallback passCode */}
              <QRCodeSVG 
                value={JSON.stringify({ v: 1, token: generatedPass.rawToken || generatedPass.passCode })} 
                size={200}
                level="H"
              />
            </div>
            <h3 className="text-lg font-bold text-text">Scan at Security Gate</h3>
            <p className="text-sm text-muted mt-1 max-w-xs">
              Visitor: {generatedPass.visitor?.name || generatedPass.visitorId?.name || generatedPass.visitorName} <br/>
              Valid until: {new Date(generatedPass.visit?.validUntil || generatedPass.validUntil).toLocaleDateString()}
            </p>
            {generatedPass.passCode && !generatedPass.rawToken && (
              <p className="text-md font-bold mt-2 tracking-widest text-primary">
                PIN: {generatedPass.passCode}
              </p>
            )}
            <div className="flex w-full gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => {
                setIsPreApproveModalOpen(false);
                setTimeout(() => setGeneratedPass(null), 200);
              }}>Done</Button>
              <Button className="flex-1" onClick={() => toast.success("Pass copied to clipboard!")}>Share Pass</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
