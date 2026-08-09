"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthShell, { authButtonClass, authInputClass } from "./AuthShell";
import { registerUser } from "@/lib/mockAuth";
import { useToast } from "@/components/ui/ToastProvider";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get("password") !== data.get("confirmPassword")) {
      setError("Passwords do not match. Please enter them again.");
      return;
    }
    if (!registerUser({ name: String(data.get("name")).trim(), email: String(data.get("email")).trim(), password: String(data.get("password")) })) {
      setError("An account with this email already exists.");
      return;
    }
    toast("Account created. You can now sign in.");
    startTransition(() => router.push("/login"));
  };

  return (
    <AuthShell eyebrow="Create your workspace access" title="Register your account" description="Set up your details to access the inventory management dashboard." footerText="Already have an account?" footerLink="/login" footerLabel="Sign in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700" htmlFor="register-name">
          Full name
          <span className="relative mt-1.5 block"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="register-name" name="name" autoComplete="name" required minLength={2} placeholder="Your full name" className={`${authInputClass} mt-0 pl-10`} /></span>
        </label>

        <label className="block text-sm font-semibold text-slate-700" htmlFor="register-email">
          Email address
          <span className="relative mt-1.5 block"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="register-email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={`${authInputClass} mt-0 pl-10`} /></span>
        </label>

        <label className="block text-sm font-semibold text-slate-700" htmlFor="register-password">
          Password
          <span className="relative mt-1.5 block"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="register-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}" title="Use at least 8 characters with a letter and a number." placeholder="At least 8 characters" className={`${authInputClass} mt-0 px-10`} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? "Hide passwords" : "Show passwords"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span>
          <span className="mt-1.5 block text-xs font-normal text-slate-400">Use 8+ characters with at least one letter and one number.</span>
        </label>

        <label className="block text-sm font-semibold text-slate-700" htmlFor="register-confirm-password">
          Confirm password
          <span className="relative mt-1.5 block"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="register-confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} placeholder="Repeat your password" className={`${authInputClass} mt-0 pl-10`} /></span>
        </label>

        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">{error}</p>}

        <button type="submit" disabled={isPending} className={authButtonClass}>
          {isPending ? "Creating account…" : "Create account"}
          {!isPending && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </AuthShell>
  );
}
