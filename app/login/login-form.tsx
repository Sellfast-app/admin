"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, ArrowRight } from "lucide-react";
import Logo from "@/components/svgIcons/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !enabled) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      const body = await response.json();
      if (!response.ok || body.status !== "success") throw new Error(body.message || "Unable to sign in.");
      router.replace("/overview");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally { setPending(false); }
  }

  return (
    <main className="min-h-dvh bg-background px-5 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-sm flex-col">
        <Logo className="mb-14 h-auto w-40 max-w-full text-primary" role="img" aria-label="Swiftree" />
        <p className="mb-2 text-sm font-medium text-muted-foreground">Swiftree Admin</p>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        {!enabled && <p role="status" className="mt-4 text-sm text-muted-foreground">Sign-in is not enabled yet. <Link href="/overview" className="underline">Open dashboard</Link></p>}
        <form onSubmit={submit} className="mt-8 space-y-5" aria-busy={pending}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="username" required disabled={pending || !enabled} className="h-12 text-base md:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required disabled={pending || !enabled} aria-describedby={error ? "login-error" : undefined} className="h-12 pr-12 text-base md:text-base" />
              <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"} aria-pressed={visible} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-md text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary">
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p id="login-error" role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending || !enabled} className="h-12 w-full text-base font-semibold text-black">
            {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}
