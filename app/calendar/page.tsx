import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";

export default function Page() {
  return <AppShell role="student"><Dashboard role="student" section="calendar" /></AppShell>;
}
