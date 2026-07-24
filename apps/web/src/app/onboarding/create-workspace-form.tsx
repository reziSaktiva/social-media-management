"use client";

import { useState, type FormEvent } from "react";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

import { createWorkspaceAction } from "./actions";

export function CreateWorkspaceForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createWorkspaceAction(name);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  return (
    <VStack gap={4}>
      {error ? <Banner status="error" title={error} /> : null}

      <form onSubmit={handleSubmit}>
        <VStack gap={4}>
          <TextInput
            type="text"
            label="Nama Workspace"
            value={name}
            onChange={setName}
            isRequired
            width="100%"
            htmlName="name"
            placeholder="mis. Tim Marketing Acme"
          />
          <Button
            type="submit"
            label="Buat Workspace"
            variant="primary"
            width="100%"
            isLoading={isSubmitting}
          />
        </VStack>
      </form>
    </VStack>
  );
}
