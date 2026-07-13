"use client";

import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  LoginFormProps,
  loginSchema,
  LoginSchema,
  useLogin,
} from "@/features/auth";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import FormField from "@/components/ui/FormField";

import { getSafePostLoginRedirect } from "@/lib/auth";
import { AppToast } from "@/lib/toast";
import { ApiErrorResponse } from "@/features/documents/types/document";
import { ROUTES } from "@/constants/routes";


export default function LoginForm({ returnTo }: LoginFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  async function onSubmit(data: LoginSchema) {
    try {
      const response = await loginMutation.loginAsync(data);
      console.log(response)
      AppToast.success({
        title: `${response.message}`,
        description: "You have successfully logged in.",
      });
      router.replace(ROUTES.DOCUMENTS);

    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;

      AppToast.error({
        title: "Login failed",
        description: err.response?.data?.message || "An error occurred during login.",
      });

    }
  }

  console.log(process.env.NEXT_PUBLIC_API_URL)

     console.log("Deployed-1.1")

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5  text-white"
    >
      {/* Email */}

      <FormField
        label="Email Address"
        htmlFor="email"
        required
      >
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </FormField>

      {/* Password */}

      <FormField
        label="Password"
        htmlFor="password"
        required
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </FormField>

      {/* Login Button */}
      <Button
        type="submit"
        loading={loginMutation.isPending}
      >
        Login
      </Button>
    </form>
  );
}
