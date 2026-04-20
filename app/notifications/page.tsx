import { UserGate } from "@/components/auth/user-gate";
import { NotificationsScreen } from "@/components/screens/notifications-screen";

export default function NotificationsPage() {
  return (
    <UserGate>
      <NotificationsScreen />
    </UserGate>
  );
}
