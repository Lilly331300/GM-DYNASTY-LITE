import { AppShell } from "@/components/layout/AppShell";

export default function RosterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}