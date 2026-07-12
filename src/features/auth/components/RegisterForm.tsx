"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema, RegisterSchema, useRegister } from "@/features/auth";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import FormField from "@/components/ui/FormField";
import { ROUTES } from "@/constants/routes";
import { AppToast } from "@/lib/toast";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const { registerAsync, isPending } = useRegister();

  async function onSubmit(data: RegisterSchema) {
    try {
      const response = await registerAsync(data);
      AppToast.success({
        title: `${response.message}`,
        description: "You have successfully registered.",
      });

      router.replace(ROUTES.LOGIN);
    } catch (error) {
      AppToast.error({
        title: "Registration failed",
        description: "An error occurred during registration.",
      });
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField label="Full Name" htmlFor="fullName" required>
        <Input
          id="fullName"
          placeholder="John Doe"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" required>
        <Input
          id="email"
          type="email"
          placeholder="john@gmail.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" required>
        <PasswordInput
          id="password"
          error={errors.password?.message}
          {...register("password")}
        />
      </FormField>

      <FormField label="Confirm Password" htmlFor="confirmPassword" required>
        <PasswordInput
          id="confirmPassword"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </FormField>

      <Button type="submit" loading={isPending}>
        Register
      </Button>
    </form>
  );
}
