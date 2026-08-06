"use client";

import { useMemo, useState, type FormEvent } from "react";

import { Avatar } from "@astryxdesign/core/Avatar";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { FileInput } from "@astryxdesign/core/FileInput";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Section } from "@astryxdesign/core/Section";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import type { UserProfileRecord } from "@/domains/identity";

import { updateProfileAction } from "../actions";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB, sesuai mockup account-profile.html

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

  function handleAvatarChange(files: File | File[] | null) {
    const file = Array.isArray(files) ? (files[0] ?? null) : files;
    setAvatarFile(file);
    setIsSuccess(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    if (avatarFile) {
      formData.set("avatar", avatarFile);
    }

    const result = await updateProfileAction(formData);

    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setName(result.name);
    setImage(result.image);
    setAvatarFile(null);
    setIsSuccess(true);
    setIsSubmitting(false);
  }

  return (
    <Section>
      <VStack gap={5}>
        <Heading level={2}>Profil</Heading>

        {error ? <Banner status="error" title={error} /> : null}
        {isSuccess ? (
          <Banner status="success" title="Profil berhasil diperbarui." />
        ) : null}

        <form onSubmit={handleSubmit}>
          <VStack gap={5}>
            <HStack gap={4} align="center">
              <Avatar name={name} src={avatarPreviewUrl} size="xl" />
              <FileInput
                label="Foto Profil"
                value={avatarFile}
                onChange={handleAvatarChange}
                accept="image/jpeg,image/png"
                maxSize={MAX_AVATAR_BYTES}
                placeholder="Upload Foto"
                description="JPG/PNG, maks 2MB"
              />
            </HStack>

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
        </form>
      </VStack>
    </Section>
  );
}
