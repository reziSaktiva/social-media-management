import { redirect } from "next/navigation";

// Menutup celah ADR-046 (setiap section wajib punya page.tsx di root
// path-nya). /account tidak punya satu "default view" yang terdefinisi di
// baseline — Profile dipilih sebagai landing pertama (nav item pertama di
// AccountSideNav), bukan konten yang direndernya sendiri.
export default function Page() {
  redirect("/account/profile");
}
