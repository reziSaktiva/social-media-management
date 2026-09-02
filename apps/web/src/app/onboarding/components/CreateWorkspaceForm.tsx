"use client";

import { useState, type FormEvent } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
    <FieldGroup>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      ) : null}

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="workspace-name">Nama Workspace</FieldLabel>
            <Input
              id="workspace-name"
              name="name"
              type="text"
              required
              placeholder="mis. Tim Marketing Acme"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
              ) : null}
              Buat Workspace
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldGroup>
  );
}
