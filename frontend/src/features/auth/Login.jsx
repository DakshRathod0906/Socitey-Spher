import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Input, Checkbox } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleResend = async () => {
    const emailToUse = unverifiedEmail || getValues("email");
    if (!emailToUse) {
      toast.error("Please enter your email address first");
      return;
    }
    setIsResending(true);
    try {
      const res = await api.post("/auth/resend-verification", { email: emailToUse });
      toast.success(res.data.message || "Verification link sent! Please check your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to resend verification link");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setUnverifiedEmail("");

      const user = await login(data.email, data.password);

      toast.success("Welcome back!");

      // Route based on role
      const role = user.role;
      if (role === "super_admin") navigate("/super-admin");
      else if (role === "society_admin") navigate("/admin");
      else if (role === "security") navigate("/security");
      else if (role === "service_staff") navigate("/service");
      else navigate("/resident");
    } catch (error) {
      if (error.message?.includes("verify your email")) {
        setUnverifiedEmail(data.email);
      }
      toast.error(error.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            {...register("rememberMe")}
          />
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {unverifiedEmail && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between text-xs">
            <span className="text-amber-700 dark:text-amber-300 font-medium">
              Email pending verification
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              {isResending ? "Sending link..." : "Resend Link"}
            </button>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link
          to="/register-society"
          className="font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Register your society
        </Link>
      </div>
    </div>
  );
}
