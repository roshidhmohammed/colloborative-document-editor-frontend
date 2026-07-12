import Link from "next/link";
import LoginForm from "@/features/auth/components/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    returnTo?: string | string[];
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const { returnTo } = await searchParams;
  const redirectPath =
    typeof returnTo === "string" ? returnTo : undefined;

    console.log("Deployed-1")

  return (
    <>
      <header className="mb-8 text-white  text-center">
        <h1 className="text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to continue to your workspace.
        </p>
      </header>

      <LoginForm returnTo={redirectPath} />

      <footer className="mt-8 text-center text-sm">
        Are you a new user?
        <Link
          href="/register"
          className="text-blue-600 hover:underline ml-1"
        >
          Create Account
        </Link>
      </footer>
    </>
  );
}
