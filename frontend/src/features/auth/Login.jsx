import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Input, Checkbox } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

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
      // error is already normalized by the errorMapper via Axios interceptor
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
