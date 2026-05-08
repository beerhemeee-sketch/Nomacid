import type { Profile } from "@/lib/types";

export function isAdmin(profile: Pick<Profile, "role">) {
  return profile.role === "admin";
}
