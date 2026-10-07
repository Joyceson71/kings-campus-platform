import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard";

export default async function Page({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = ["dashboard"] } = await params;
  return <AppShell role="faculty"><Dashboard role="faculty" section={section.join("-")} /></AppShell>;
}
