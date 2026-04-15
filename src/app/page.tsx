"use client";

import { LoginForm } from "@/components/login-form";

export default function AuthPortal() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      {/* Background gradient matching the brand image */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1a1040] via-[#6b1a3a] to-[#e82030]" />
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  );
}
