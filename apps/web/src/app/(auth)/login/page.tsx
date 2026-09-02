import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { googleOAuthEnabled } from "@/lib/env";

import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk</CardTitle>
        <CardDescription>
          Kelola konten dan jadwal publikasi workspace Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <LoginForm isGoogleEnabled={googleOAuthEnabled()} />

        {/* eslint-disable-next-line no-restricted-syntax -- T-097.1: file ini
            sudah dimigrasi ke komposisi Tailwind shadcn (ADR-097), bukan lagi
            HStack Astryx. */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Lupa password?
          </Link>
          <Text variant="muted">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Daftar
            </Link>
          </Text>
        </div>
      </CardContent>
    </Card>
  );
}
