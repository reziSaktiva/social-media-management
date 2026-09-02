"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { SquareLock02Icon } from "@hugeicons/core-free-icons";

import { authClient } from "@/lib/better-auth/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { acceptInviteAction } from "../actions";

export function AcceptInviteForm({
  token,
  email,
  isExistingUser,
  onAccepted,
}: {
  token: string;
  email: string;
  isExistingUser: boolean;
  /**
   * Dipanggil setelah `acceptInviteAction` berhasil — parent
   * (`AcceptInvitePageClient`) yang memutuskan kapan menampilkan state
   * "Success" dan redirect, BUKAN component ini. Lihat doc comment di
   * `AcceptInvitePageClient.tsx` untuk alasan pemisahan ini (Server Action
   * memicu refresh RSC route saat ini, yang akan meng-unmount component
   * ini begitu invitation tidak lagi berstatus `pending`).
   */
  onAccepted: () => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function finalizeMembership() {
    const result = await acceptInviteAction(token);
    if (result.error) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }
    setIsSubmitting(false);
    onAccepted();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isExistingUser) {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        });
        if (signInError) {
          setIsSubmitting(false);
          setError(
            signInError.message ??
              "Password salah. Coba lagi atau reset password Anda.",
          );
          return;
        }
      } else {
        const { error: signUpError } = await authClient.signUp.email({
          name,
          email,
          password,
        });
        if (signUpError) {
          setIsSubmitting(false);
          setError(signUpError.message ?? "Gagal membuat akun. Coba lagi.");
          return;
        }
      }

      await finalizeMembership();
    } catch {
      setIsSubmitting(false);
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    }
  }

  return (
    <FieldGroup>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      ) : null}

      {isExistingUser ? (
        <Alert>
          <AlertTitle>Email ini sudah terdaftar</AlertTitle>
          <AlertDescription>
            Masuk untuk melanjutkan bergabung ke workspace.
          </AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="accept-invite-email">Email</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="accept-invite-email"
                type="email"
                value={email}
                readOnly
              />
              <InputGroupAddon>
                <HugeiconsIcon
                  icon={SquareLock02Icon}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              Email terkunci sesuai undangan, tidak bisa diubah.
            </FieldDescription>
          </Field>

          {isExistingUser ? null : (
            <Field>
              <FieldLabel htmlFor="accept-invite-name">Nama Lengkap</FieldLabel>
              <Input
                id="accept-invite-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="accept-invite-password">Password</FieldLabel>
            <Input
              id="accept-invite-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner /> : null}
              {isExistingUser
                ? "Masuk & Gabung ke Workspace"
                : "Buat Akun & Gabung ke Workspace"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      {isExistingUser ? (
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Lupa password?
        </Link>
      ) : null}
    </FieldGroup>
  );
}
