import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token || error) {
    return (
      <Card padding={8} width="100%">
        <VStack gap={4}>
          <Heading level={1}>Tautan Tidak Valid</Heading>
          <Banner
            status="error"
            title="Tautan reset password tidak valid atau sudah kedaluwarsa."
            description="Minta tautan baru untuk mengatur ulang password Anda."
          />
          <Link href="/forgot-password">Minta tautan reset baru</Link>
        </VStack>
      </Card>
    );
  }

  return (
    <Card padding={8} width="100%">
      <VStack gap={4}>
        <VStack gap={1}>
          <Heading level={1}>Buat Password Baru</Heading>
          <Text type="supporting">Masukkan password baru untuk akun Anda</Text>
        </VStack>

        <ResetPasswordForm token={token} />
      </VStack>
    </Card>
  );
}
