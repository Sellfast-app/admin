import { LoginForm } from "./login-form";
import { isAdminAuthEnabled } from "@/lib/admin-api";

export default function LoginPage() {
  return <LoginForm enabled={isAdminAuthEnabled()} />;
}
