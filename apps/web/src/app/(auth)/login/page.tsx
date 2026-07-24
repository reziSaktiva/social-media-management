import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import { googleOAuthEnabled } from "@/lib/env";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Card padding={8} width="100%">
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={1}>Masuk</Heading>
          <Text type="supporting">
            Kelola konten dan jadwal publikasi workspace Anda
          </Text>
        </VStack>

        <LoginForm isGoogleEnabled={googleOAuthEnabled()} />

        <HStack justify="between" wrap="wrap" gap={2}>
          <Link href="/forgot-password">Lupa password?</Link>
          <Text type="supporting">
            Belum punya akun? <Link href="/register">Daftar</Link>
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}
