"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Divider } from "@astryxdesign/core/Divider";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import { authClient } from "@/lib/better-auth/client";

export function RegisterForm({
  isGoogleEnabled,
}: {
  isGoogleEnabled: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAgreed, setHasAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!hasAgreed) {
      setError(
        "Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.",
      );
      return;
    }

    setIsSubmitting(true);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message ?? "Gagal membuat akun. Coba lagi.");
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
    <VStack gap={4}>
      {error ? <Banner status="error" title={error} /> : null}

      {isGoogleEnabled ? (
        <>
          <Button
            label="Daftar dengan Google"
            variant="secondary"
            width="100%"
            isLoading={isGoogleLoading}
            onClick={handleGoogleSignIn}
          />
          <Divider label="atau daftar dengan email" />
        </>
      ) : null}

      <form onSubmit={handleSubmit}>
        <VStack gap={4}>
          <TextInput
            type="text"
            label="Nama Lengkap"
            value={name}
            onChange={setName}
            isRequired
            width="100%"
            htmlName="name"
          />
          <TextInput
            type="email"
            label="Email"
            value={email}
            onChange={setEmail}
            isRequired
            width="100%"
            htmlName="email"
          />
          <TextInput
            type="password"
            label="Password"
            value={password}
            onChange={setPassword}
            isRequired
            width="100%"
            htmlName="password"
          />
          <CheckboxInput
            label="Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi"
            value={hasAgreed}
            onChange={setHasAgreed}
          />
          <Button
            type="submit"
            label="Buat Akun"
            variant="primary"
            width="100%"
            isLoading={isSubmitting}
          />
        </VStack>
      </form>
    </VStack>
  );
}
