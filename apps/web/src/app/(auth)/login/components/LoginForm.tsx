"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Divider } from "@astryxdesign/core/Divider";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import { authClient } from "@/lib/better-auth/client";

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
    <VStack gap={4}>
      {error ? <Banner status="error" title={error} /> : null}

      {isGoogleEnabled ? (
        <>
          <Button
            label="Lanjutkan dengan Google"
            variant="secondary"
            width="100%"
            isLoading={isGoogleLoading}
            onClick={handleGoogleSignIn}
          />
          <Divider label="atau masuk dengan email" />
        </>
      ) : null}

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
            label="Masuk"
            variant="primary"
            width="100%"
            isLoading={isSubmitting}
          />
        </VStack>
      </form>
    </VStack>
  );
}
