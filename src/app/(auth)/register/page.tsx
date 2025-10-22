import { RegisterForm } from "@/components/auth/RegisterForm";
import { Bot } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Bot className="size-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground ">
            ChatBot AI
          </span>
        </Link>
        <RegisterForm />
      </div>
    </div>
  );
}
