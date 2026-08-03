"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import AuthShell, { authButtonClass, authInputClass } from "./AuthShell";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    startTransition(() => router.push("/dashboard"));
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to your account" description="Enter your account details to continue to the inventory dashboard." footerText="New to StockFlow?" footerLink="/register" footerLabel="Create an account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-semibold text-slate-700" htmlFor="login-email">
          Email address
          <span className="relative mt-1.5 block">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="login-email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={`${authInputClass} mt-0 pl-10`} />
          </span>
        </label>

        <label className="block text-sm font-semibold text-slate-700" htmlFor="login-password">
          Password
          <span className="relative mt-1.5 block">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={8} placeholder="Enter your password" className={`${authInputClass} mt-0 px-10`} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        <label className="flex w-fit items-center gap-2 text-sm text-slate-600"><input name="remember" type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />Keep me signed in</label>

        <button type="submit" disabled={isPending} className={authButtonClass}>
          {isPending ? "Opening dashboard…" : "Sign in"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </AuthShell>
  );
}
