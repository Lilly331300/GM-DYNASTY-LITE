import { AppShell } from "@/components/layout/AppShell";

export default function TeamProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}