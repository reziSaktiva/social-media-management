"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import { authClient } from "@/lib/better-auth/client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function sendResetLink(targetEmail: string) {
    const { error: requestError } = await authClient.requestPasswordReset({
      email: targetEmail,
      redirectTo: "/reset-password",
    });

    if (requestError) {
      setError(
        requestError.message ?? "Gagal mengirim tautan reset. Coba lagi.",
      );
      return false;
    }

    setError(null);
    setSentTo(targetEmail);
    return true;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    await sendResetLink(email);
    setIsSubmitting(false);
  }

  async function handleResend() {
    if (!sentTo) return;
    setIsResending(true);
    await sendResetLink(sentTo);
    setIsResending(false);
  }

  if (sentTo) {
    return (
      /* eslint-disable-next-line no-restricted-syntax -- T-097.2: file ini
         sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
         VStack Astryx. */
      <div className="flex flex-col items-center gap-3 text-center">
        <Text variant="h3">Cek Email Anda</Text>
        <Text variant="muted">
          Tautan reset password sudah dikirim ke{" "}
          <span className="font-semibold text-primary">{sentTo}</span>. Tautan
          berlaku selama 1 jam.
        </Text>
        <Button variant="ghost" disabled={isResending} onClick={handleResend}>
          {isResending ? (
            <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
          ) : null}
          Kirim Ulang
        </Button>
      </div>
    );
  }

  return (
    <FieldGroup>
      {/* eslint-disable-next-line no-restricted-syntax -- T-097.2, sama seperti di atas */}
      <div className="flex flex-col gap-1">
        <Text variant="h3">Lupa Password</Text>
        <Text variant="muted">
          Masukkan email akun Anda, kami akan mengirim tautan reset password
        </Text>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
            <Input
              id="forgot-password-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
              ) : null}
              Kirim Tautan Reset
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <Link
        href="/login"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        ← Kembali ke Masuk
      </Link>
    </FieldGroup>
  );
}
