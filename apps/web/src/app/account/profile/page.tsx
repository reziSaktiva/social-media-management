import { asUserId } from "@social/shared";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { IdentityService } from "@/domains/identity";
import { supabaseAvatarStorageAdapter } from "@/lib/adapters/avatar-storage";
import { auth } from "@/lib/better-auth/auth";
import { identityRepository } from "@/lib/repositories/identity";

import { ProfileForm } from "./components/ProfileForm";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const identityService = new IdentityService(
    identityRepository,
    supabaseAvatarStorageAdapter,
  );
  const profile = await identityService.getProfile(asUserId(session.user.id));
  if (!profile) {
    redirect("/login");
  }

  return <ProfileForm profile={profile} />;
}
