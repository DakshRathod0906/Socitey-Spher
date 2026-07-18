import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../components/ui";
import api from "../../services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(res.data.message || "Your email has been successfully verified!");
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed. The link may be expired.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="animate-fade-in text-center space-y-4 py-8">
      <div className="flex justify-center mb-4">
        {status === "verifying" && (
          <div className="h-16 w-16 bg-primary-light/30 text-primary rounded-full flex items-center justify-center animate-pulse">
            <span className="font-bold text-lg">...</span>
          </div>
        )}
        {status === "success" && (
          <div className="h-16 w-16 bg-success-light text-success rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8" />
          </div>
        )}
        {status === "error" && (
          <div className="h-16 w-16 bg-danger-light text-danger rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8" />
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-text">
        {status === "verifying" && "Verifying Email"}
        {status === "success" && "Email Verified"}
        {status === "error" && "Verification Failed"}
      </h3>
      
      <p className="text-muted max-w-sm mx-auto">
        {status === "verifying" ? "Please wait while we verify your email address..." : message}
      </p>
      
      {(status === "success" || status === "error") && (
        <div className="mt-8">
          <Link to="/login">
            <Button className="w-full">
              Proceed to Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
