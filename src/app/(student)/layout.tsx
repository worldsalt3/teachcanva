import { StudentBottomNav } from "@/components/layout/bottom-nav";
import { DevRoleSwitch } from "@/components/layout/dev-role-switch";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col pb-nav">{children}</div>
      <DevRoleSwitch />
      <StudentBottomNav />
    </div>
  );
}
