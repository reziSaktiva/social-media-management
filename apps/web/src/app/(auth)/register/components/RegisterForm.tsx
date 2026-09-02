"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import { authClient } from "@/lib/better-auth/client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
              Daftar dengan Google
            </Button>
          </Field>
          <FieldSeparator>atau daftar dengan email</FieldSeparator>
        </>
      ) : null}

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="register-name">Nama Lengkap</FieldLabel>
            <Input
              id="register-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="register-email">Email</FieldLabel>
            <Input
              id="register-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="register-password">Password</FieldLabel>
            <Input
              id="register-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id="register-agree"
              checked={hasAgreed}
              onCheckedChange={(checked) => setHasAgreed(checked === true)}
            />
            <FieldLabel htmlFor="register-agree" className="font-normal">
              Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi
            </FieldLabel>
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
              ) : null}
              Buat Akun
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldGroup>
  );
}
