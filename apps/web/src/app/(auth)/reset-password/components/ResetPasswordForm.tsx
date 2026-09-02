"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import { authClient } from "@/lib/better-auth/client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword,
      token,
    });

    setIsSubmitting(false);

    if (resetError) {
      setError(
        resetError.message ?? "Gagal menyimpan password baru. Coba lagi.",
      );
      return;
    }

    router.push("/login");
  }

  return (
    <FieldGroup>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="reset-password-new">Password Baru</FieldLabel>
            <Input
              id="reset-password-new"
              name="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="reset-password-confirm">
              Konfirmasi Password
            </FieldLabel>
            <Input
              id="reset-password-confirm"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
              ) : null}
              Simpan Password Baru
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldGroup>
  );
}
