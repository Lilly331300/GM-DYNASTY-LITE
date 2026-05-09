import { AppShell } from "@/components/layout/AppShell";

export default function DepthChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}