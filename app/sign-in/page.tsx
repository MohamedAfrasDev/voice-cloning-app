import { AuthForm } from "@/app/auth/auth-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthForm mode="sign-in" />
    </div>
  );
}
