import { useState, useEffect } from "react";
import { QrReader } from "@yudiel/react-qr-scanner";
import { Shield, Camera, Keyboard, X } from "lucide-react";
import { Button, Input, Modal } from "../../components/ui";
import { useVerifyVisit } from "./hooks/useSecurityVisits";
import VerificationScreen from "./VerificationScreen";
import { toast } from "sonner";

export default function Scanner() {
  const [mode, setMode] = useState("qr"); // 'qr' or 'manual'
  const [manualToken, setManualToken] = useState("");
  const [verifiedVisit, setVerifiedVisit] = useState(null);

  const { mutate: verifyToken, isPending } = useVerifyVisit({
    onSuccess: (data) => {
      setVerifiedVisit(data.visit);
    },
    onError: () => {
      // toast is already handled in hook
      setTimeout(() => setMode("qr"), 2000); // Give them time to read error before scanning again
    }
  });

  const handleDecode = (result) => {
    if (isPending || verifiedVisit) return;
    try {
      // Our QR contains JSON: { v: 1, token: "..." }
      const parsed = JSON.parse(result);
      if (parsed.token) {
        verifyToken({ qrToken: parsed.token });
      } else {
        toast.error("Invalid QR Format");
      }
    } catch (e) {
      // Fallback: maybe it's just the raw token string
      verifyToken({ qrToken: result });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    verifyToken({ qrToken: manualToken });
  };

  if (verifiedVisit) {
    return (
      <VerificationScreen 
        visit={verifiedVisit} 
        onClose={() => {
          setVerifiedVisit(null);
          setMode("qr");
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto">
      <div className="flex items-center justify-between p-4 bg-surface border-b border-border">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Visitor Scanner
        </h1>
        <Button variant="ghost" size="sm" onClick={() => setMode(mode === "qr" ? "manual" : "qr")}>
          {mode === "qr" ? <Keyboard className="h-4 w-4 mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
          {mode === "qr" ? "Manual Entry" : "Use Camera"}
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background">
        {mode === "qr" ? (
          <div className="w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-surface">
            {!isPending ? (
              <QrReader
                onResult={(result, error) => {
                  if (!!result) {
                    handleDecode(result?.text);
                  }
                }}
                constraints={{ facingMode: "environment" }}
                videoStyle={{ objectFit: "cover" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p>Verifying...</p>
                </div>
              </div>
            )}
            
            {/* Overlay Grid */}
            <div className="absolute inset-0 border-2 border-primary/50 m-12 rounded-xl pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg -mb-1 -mr-1"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="w-full max-w-sm space-y-4">
            <div className="text-center mb-8">
              <div className="bg-primary-light w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Keyboard className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Manual Token Entry</h2>
              <p className="text-sm text-muted">Enter the 6-digit PIN or secure token</p>
            </div>
            
            <Input 
              placeholder="e.g. 123456" 
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="text-center text-xl tracking-widest py-6"
              autoFocus
            />
            
            <Button type="submit" className="w-full py-6 text-lg" loading={isPending}>
              Verify Pass
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
