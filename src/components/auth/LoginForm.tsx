"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import AuthShell, { authButtonClass, authInputClass } from "./AuthShell";
import { signIn } from "@/lib/mockAuth";
import { useToast } from "@/components/ui/ToastProvider";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const toast = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (!signIn(String(data.get("email")), String(data.get("password")), data.get("remember") === "on")) {
      setError("Email or password is incorrect. Try the demo account below.");
      return;
    }
    toast("Signed in successfully.");
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

        <div className="rounded-xl bg-indigo-50 px-3.5 py-3 text-xs text-indigo-700"><strong>Demo account</strong><br />admin@stockflow.demo · demo1234</div>
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">{error}</p>}

        <button type="submit" disabled={isPending} className={authButtonClass}>
          {isPending ? "Opening dashboard…" : "Sign in"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </AuthShell>
  );
}
