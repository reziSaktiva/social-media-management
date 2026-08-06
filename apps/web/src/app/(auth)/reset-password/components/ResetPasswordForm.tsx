"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import { authClient } from "@/lib/better-auth/client";

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
    <VStack gap={4}>
      {error ? <Banner status="error" title={error} /> : null}

      <form onSubmit={handleSubmit}>
        <VStack gap={4}>
          <TextInput
            type="password"
            label="Password Baru"
            value={newPassword}
            onChange={setNewPassword}
            isRequired
            width="100%"
            htmlName="newPassword"
          />
          <TextInput
            type="password"
            label="Konfirmasi Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            isRequired
            width="100%"
            htmlName="confirmPassword"
          />
          <Button
            type="submit"
            label="Simpan Password Baru"
            variant="primary"
            width="100%"
            isLoading={isSubmitting}
          />
        </VStack>
      </form>
    </VStack>
  );
}
