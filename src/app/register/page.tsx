import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register | StockFlow",
  description: "Create an account for the StockFlow inventory management dashboard.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
