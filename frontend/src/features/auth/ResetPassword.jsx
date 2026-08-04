import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button, Input } from "../../components/ui";
import api from "../../services/api";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing password reset token");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      toast.success(res.data.message || "Password updated successfully!");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="animate-fade-in p-6 bg-danger/10 border border-danger/20 rounded-xl text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>
        <div>
          <h3 className="font-semibold text-text text-base">Invalid Reset Link</h3>
          <p className="text-xs text-muted mt-1">
            This password reset link is invalid or has expired. Please request a new link.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/forgot-password">
            <Button size="sm">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text">Create New Password</h2>
        <p className="text-sm text-muted mt-1">
          Your email has been verified. Please enter your new account password below.
        </p>
      </div>

      {isSuccess ? (
        <div className="p-6 bg-success/10 border border-success/20 rounded-xl text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="font-semibold text-text text-base">Password Reset Completed!</h3>
            <p className="text-xs text-muted mt-1">
              Redirecting you to the sign-in page...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" loading={isLoading}>
            <Lock size={16} className="mr-2" />
            Reset Password
          </Button>
        </form>
      )}
    </div>
  );
}
