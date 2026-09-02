"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import { authClient } from "@/lib/better-auth/client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({ isGoogleEnabled }: { isGoogleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(
        signInError.message ??
          "Email atau password salah. Coba lagi atau reset password Anda.",
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  }

  return (
    <FieldGroup>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      ) : null}

      {isGoogleEnabled ? (
        <>
          <Field>
            <Button
              type="button"
              variant="secondary"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
            >
              {isGoogleLoading ? (
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
              ) : null}
              Lanjutkan dengan Google
            </Button>
          </Field>
          <FieldSeparator>atau masuk dengan email</FieldSeparator>
        </>
      ) : null}

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <Input
              id="login-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="login-password">Password</FieldLabel>
            <Input
              id="login-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
              ) : null}
              Masuk
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldGroup>
  );
}
