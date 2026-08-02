import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | StockFlow",
  description: "Sign in to the StockFlow inventory management dashboard.",
};

export default function LoginPage() {
  return <LoginForm />;
}
