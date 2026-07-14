import { TeacherBottomNav } from "@/components/layout/bottom-nav";
import { AuthGate } from "@/components/layout/auth-gate";

export default function TeacherWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AuthGate />
      <div className="flex flex-1 flex-col pb-nav">{children}</div>
      <TeacherBottomNav />
    </div>
  );
}
