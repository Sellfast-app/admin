import { AdminShell } from "./_components/admin-shell";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, fetchAdminProfile, isAdminAuthEnabled } from "@/lib/admin-api";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  if (isAdminAuthEnabled()) {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token) redirect("/login");
    const profile = await fetchAdminProfile(token);
    if (!profile.ok) {
      if ([401, 403].includes(profile.status)) redirect("/login");
      return <main className="mx-auto max-w-md p-8"><h1 className="text-xl font-semibold">Unable to verify your session</h1><p className="mt-3 text-sm">Please try again shortly.</p><a href="/login" className="mt-6 inline-block underline">Return to sign in</a></main>;
    }
  }
  return <AdminShell>{children}</AdminShell>;
};

export default DashboardLayout;
