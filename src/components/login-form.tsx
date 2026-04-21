"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  RiShieldKeyholeLine,
  RiSparkling2Line,
  RiEyeLine,
  RiScales3Line,
  RiRadarLine,
} from "@remixicon/react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const ok = await login(email.trim().toLowerCase());
        if (!ok) {
          toast.error("No account found for that email.");
          return;
        }
        toast.success("Welcome back");
        router.push("/explore");
      } else {
        router.push(`/onboarding?email=${encodeURIComponent(email.trim())}`);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left: form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <RiShieldKeyholeLine className="size-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-balance text-sm text-muted-foreground">
                  {isLogin
                    ? "Sign in to your Sentinel workspace"
                    : "Set up your workspace and start protecting your brand"}
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Work email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                />
              </Field>

              {isLogin && (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Forgot?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10"
                  />
                </Field>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !email.trim()}
                className="w-full"
              >
                <RiShieldKeyholeLine className="size-4" />
                {isSubmitting
                  ? isLogin
                    ? "Signing in…"
                    : "Continuing…"
                  : isLogin
                    ? "Sign in"
                    : "Get started"}
              </Button>

              <FieldDescription className="text-center">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium underline underline-offset-4 hover:text-foreground"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Right: brand upsell panel */}
          <BrandPanel />
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-primary-foreground/70 [&_a:hover]:text-primary-foreground [&_a]:text-primary-foreground/90 [&_a]:underline [&_a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

function BrandPanel() {
  const features = [
    {
      icon: RiRadarLine,
      title: "24/7 autonomous monitoring",
      copy: "Watches 120+ marketplaces, social platforms and domains.",
    },
    {
      icon: RiSparkling2Line,
      title: "AI moderation copilot",
      copy: "Reviews every infringement and drafts takedowns in seconds.",
    },
    {
      icon: RiScales3Line,
      title: "One-click enforcement",
      copy: "File DMCA and platform takedowns without leaving Sentinel.",
    },
  ];

  return (
    <div className="relative hidden overflow-hidden md:block">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_80%_0%,#2a1670_0%,#6b1a3a_55%,#e82030_100%)]" />

      {/* Mesh accents */}
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#4d2cd9] opacity-40 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[#ff3355] opacity-35 blur-3xl" />

      {/* Grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-between p-10 text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="inline-flex size-8 items-center justify-center rounded-lg bg-background backdrop-blur-sm ring-1 ring-white/20">
            <RiShieldKeyholeLine className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Sentinel</span>
          <span className="ml-2 rounded-full border border-white/20 bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground/90">
            New
          </span>
        </div>

        <div className="space-y-7">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-background px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <RiSparkling2Line className="size-3.5" />
            AI Moderation Copilot — out now
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight">
              Protect your brand
              <br />
              at the speed of the internet.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-primary-foreground/80">
              Sentinel finds, reviews and takes down counterfeits and IP
              violations across the web — powered by agentic AI.
            </p>
          </div>

          <ul className="space-y-3.5">
            {features.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-inset ring-white/15 backdrop-blur-sm">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-primary-foreground/70">
                    {copy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-xs text-primary-foreground/70">
          <div className="flex items-center gap-2">
            <RiEyeLine className="size-3.5" />
            <span>1.2M infringements removed last quarter</span>
          </div>
          <div className="flex -space-x-2">
            {["#ffcf70", "#70d1ff", "#c9a5ff"].map((c) => (
              <span
                key={c}
                className="size-6 rounded-full ring-2 ring-white/30"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
