import { AdminShell } from "./_components/admin-shell";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <AdminShell>{children}</AdminShell>;
};

export default DashboardLayout;
