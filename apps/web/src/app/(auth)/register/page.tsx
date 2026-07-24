import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import { googleOAuthEnabled } from "@/lib/env";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Card padding={8} width="100%">
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={1}>Buat Akun</Heading>
          <Text type="supporting">Mulai kelola publikasi konten tim Anda</Text>
        </VStack>

        <RegisterForm isGoogleEnabled={googleOAuthEnabled()} />

        <Text type="supporting" justify="center">
          Sudah punya akun? <Link href="/login">Masuk</Link>
        </Text>
      </VStack>
    </Card>
  );
}
