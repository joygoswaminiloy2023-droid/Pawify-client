import { Suspense } from "react";
import AuthForm from "./AuthForm";

function AuthFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-200 p-4 md:p-6">
      <div className="relative w-full max-w-[1000px] min-h-[720px] bg-white rounded-[2.5rem] shadow-2xl" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthForm />
    </Suspense>
  );
}