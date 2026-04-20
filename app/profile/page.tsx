import { UserGate } from "@/components/auth/user-gate";
import { ProfileScreen } from "@/components/screens/profile-screen";

export default function ProfilePage() {
  return (
    <UserGate>
      <ProfileScreen />
    </UserGate>
  );
}
