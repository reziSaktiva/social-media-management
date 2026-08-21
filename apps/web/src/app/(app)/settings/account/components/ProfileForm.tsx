"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Avatar } from "@astryxdesign/core/Avatar";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { FileInput } from "@astryxdesign/core/FileInput";
import { HStack } from "@astryxdesign/core/HStack";
import { Section } from "@astryxdesign/core/Section";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import {
  ALLOWED_AVATAR_ACCEPT,
  MAX_AVATAR_BYTES,
  MAX_NAME_LENGTH,
  type UserProfileRecord,
} from "@/domains/identity";

import {
  SETTINGS_BREADCRUMB_GROUP,
  SettingsPageHead,
} from "../../components/SettingsPageHead";
import { updateProfileAction } from "../actions";

// Dipakai dua kali (description sr-only FileInput + Text visual di sampingnya,
// lihat komentar di JSX) -- satu sumber supaya tidak drift kalau berubah.
const AVATAR_HINT_TEXT = "JPG/PNG, maks 2MB";

export function ProfileForm({ profile }: { profile: UserProfileRecord }) {
  const [name, setName] = useState(profile.name);
  const [image, setImage] = useState(profile.image);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File baru yang belum tersimpan didahulukan sebagai preview, jatuh balik
  // ke avatar tersimpan (`image`), lalu ke initials via Avatar `name` fallback.
  const avatarPreviewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : (image ?? undefined)),
    [avatarFile, image],
  );

  // Revoke blob URL di atas begitu diganti (file lain dipilih) atau komponen
  // unmount — mencegah blob URL menumpuk tiap kali user ganti pilihan avatar
  // sebelum submit. Bukan setState, jadi tidak melanggar react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!avatarFile || !avatarPreviewUrl) return;
    return () => URL.revokeObjectURL(avatarPreviewUrl);
  }, [avatarPreviewUrl, avatarFile]);

  function handleAvatarChange(files: File | File[] | null) {
    const file = Array.isArray(files) ? (files[0] ?? null) : files;
    setAvatarFile(file);
    setIsSuccess(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);

    if (name.trim().length > MAX_NAME_LENGTH) {
      setError(`Nama maksimal ${MAX_NAME_LENGTH} karakter.`);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    if (avatarFile) {
      formData.set("avatar", avatarFile);
    }

    try {
      const result = await updateProfileAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setName(result.name);
      setImage(result.image);
      setAvatarFile(null);
      setIsSuccess(true);
    } catch {
      setError("Gagal menyimpan profil. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <VStack gap={4} padding={4}>
      <SettingsPageHead
        pageName="Profile"
        breadcrumb={`${SETTINGS_BREADCRUMB_GROUP.account} / Profile`}
      />

      {error ? <Banner status="error" title={error} /> : null}
      {isSuccess ? (
        <Banner status="success" title="Profil berhasil diperbarui." />
      ) : null}

      <Section>
        <form onSubmit={handleSubmit}>
          <VStack gap={6}>
            <HStack gap={5} align="center">
              <Avatar name={name} src={avatarPreviewUrl} size="xl" />
              <VStack gap={1.5}>
                <FileInput
                  label="Foto Profil"
                  isLabelHidden
                  description={AVATAR_HINT_TEXT}
                  value={avatarFile}
                  onChange={handleAvatarChange}
                  accept={ALLOWED_AVATAR_ACCEPT}
                  maxSize={MAX_AVATAR_BYTES}
                  placeholder="Upload Foto"
                />
                <Text type="supporting" aria-hidden="true">
                  {AVATAR_HINT_TEXT}
                </Text>
              </VStack>
            </HStack>

            <VStack gap={5}>
              <TextInput
                type="text"
                label="Nama"
                value={name}
                onChange={setName}
                isRequired
                width="100%"
                htmlName="name"
              />

              <TextInput
                type="email"
                label="Email"
                value={profile.email}
                onChange={() => {}}
                isDisabled
                disabledMessage="Email tidak dapat diubah di sini"
                width="100%"
              />

              <Button
                type="submit"
                label="Simpan Perubahan"
                variant="primary"
                isLoading={isSubmitting}
              />
            </VStack>
          </VStack>
        </form>
      </Section>
    </VStack>
  );
}
