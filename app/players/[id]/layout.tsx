import { AppShell } from "@/components/layout/AppShell";

export default function PlayerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}