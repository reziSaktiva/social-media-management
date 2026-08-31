"use client";

import { useState, type FormEvent, type SVGProps } from "react";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Link } from "@astryxdesign/core/Link";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import { authClient } from "@/lib/better-auth/client";

import { acceptInviteAction } from "../actions";

/**
 * TextInput mendukung SVG component apa pun sebagai `startIcon` (bukan
 * hanya nama semantik `Icon`, lihat `astryx component TextInput`) — dipakai
 * di sini untuk menandai email yang terkunci ke undangan (ADR-080 poin 6),
 * bukan bagian dari daftar `IconName` bawaan Astryx.
 */
function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

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
    <VStack gap={4}>
      {error ? <Banner status="error" title={error} /> : null}

      {isExistingUser ? (
        <Banner
          status="info"
          title="Email ini sudah terdaftar"
          description="Masuk untuk melanjutkan bergabung ke workspace."
        />
      ) : null}

      <form onSubmit={handleSubmit}>
        <VStack gap={4}>
          <TextInput
            type="email"
            label="Email"
            value={email}
            onChange={() => {
              // no-op — email dikunci ke alamat undangan (ADR-080 poin 6).
            }}
            isReadOnly
            isRequired
            width="100%"
            startIcon={LockIcon}
            description="Email terkunci sesuai undangan, tidak bisa diubah."
          />

          {isExistingUser ? null : (
            <TextInput
              type="text"
              label="Nama Lengkap"
              value={name}
              onChange={setName}
              isRequired
              width="100%"
              htmlName="name"
            />
          )}

          <TextInput
            type="password"
            label="Password"
            value={password}
            onChange={setPassword}
            isRequired
            width="100%"
            htmlName="password"
          />

          <Button
            type="submit"
            label={
              isExistingUser
                ? "Masuk & Gabung ke Workspace"
                : "Buat Akun & Gabung ke Workspace"
            }
            variant="primary"
            width="100%"
            isLoading={isSubmitting}
          />
        </VStack>
      </form>

      {isExistingUser ? (
        <Link href="/forgot-password" isStandalone>
          Lupa password?
        </Link>
      ) : null}
    </VStack>
  );
}
