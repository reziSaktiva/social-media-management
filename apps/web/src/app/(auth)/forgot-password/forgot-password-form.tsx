"use client";

import { useState, type FormEvent } from "react";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import { authClient } from "@/lib/better-auth/client";

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
      <VStack gap={3} hAlign="center">
        <Heading level={1}>Cek Email Anda</Heading>
        <Text type="supporting" justify="center">
          Tautan reset password sudah dikirim ke{" "}
          <Text as="span" color="primary" weight="semibold">
            {sentTo}
          </Text>
          . Tautan berlaku selama 1 jam.
        </Text>
        <Button
          label="Kirim Ulang"
          variant="ghost"
          isLoading={isResending}
          onClick={handleResend}
        />
      </VStack>
    );
  }

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>Lupa Password</Heading>
        <Text type="supporting">
          Masukkan email akun Anda, kami akan mengirim tautan reset password
        </Text>
      </VStack>

      {error ? <Banner status="error" title={error} /> : null}

      <form onSubmit={handleSubmit}>
        <VStack gap={4}>
          <TextInput
            type="email"
            label="Email"
            value={email}
            onChange={setEmail}
            isRequired
            width="100%"
            htmlName="email"
          />
          <Button
            type="submit"
            label="Kirim Tautan Reset"
            variant="primary"
            width="100%"
            isLoading={isSubmitting}
          />
        </VStack>
      </form>

      <Link href="/login">← Kembali ke Masuk</Link>
    </VStack>
  );
}
