import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button, Input } from "../../components/ui";
import api from "../../services/api";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Password reset link sent!");
      setIsSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text">Forgot Password</h2>
        <p className="text-sm text-muted mt-1">
          Enter your registered email address to receive a password reset link.
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-6 bg-success/10 border border-success/20 rounded-xl text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="font-semibold text-text text-base">Check Your Inbox</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
              We've sent a verification link to <span className="font-medium text-text">{email}</span>. Please click the link in your email to choose a new password.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/login">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Registered Email Address"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" loading={isLoading}>
            <Mail size={16} className="mr-2" />
            Send Password Reset Link
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-medium text-muted hover:text-text transition-colors"
            >
              <ArrowLeft size={14} className="mr-1" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
