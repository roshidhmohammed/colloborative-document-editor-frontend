"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/constants/routes";

import { createDocumentSchema } from "../schemas/createDocumentSchema";
import { CreateDocumentFormValues } from "../types/document";
import { useCreateDocument } from "../hooks/useCreateDocument";
import { AppToast } from "@/lib/toast";
import { ApiErrorResponse } from "@/types/api";

const CreateDocument = () => {
  const router = useRouter();
  const createDocumentMutation = useCreateDocument();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDocumentFormValues>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      topic: "",
    },
  });

  const onSubmit = async (data: CreateDocumentFormValues) => {
    try {
      const response = await createDocumentMutation.createDocumentAsync(data);
      console.log(response)
      AppToast.success({
        title: `${response.message}`,
        description: "You have successfully logged in.",
      });
      router.replace(`${ROUTES.DOCUMENTS}/${response?.data.document?.id}/${response?.data.ownerToken}`);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      AppToast.error({
        title: "Failed To create document",
        description: err.response?.data?.message || "An error occurred during login.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            New document
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Create your next idea
          </h1>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Start with a topic and build your collaborative document from there.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <FormField label="Enter the Topic (topic to create a document)" required>
            <Input
              type="text"
              placeholder="e.g. Product launch plan"
              error={errors.topic?.message}
              className="border-slate-700 bg-slate-900/80 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-0"
              {...register("topic")}
            />
          </FormField>

          <div className="flex justify-center">
            <Button
              type="submit"
              loading={createDocumentMutation.isPending}
              className="mx-auto w-auto rounded-full bg-cyan-500 px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDocument;
