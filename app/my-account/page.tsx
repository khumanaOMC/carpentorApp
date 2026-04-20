import { UserGate } from "@/components/auth/user-gate";
import { MyAccountScreen } from "@/components/screens/my-account-screen";

export default function MyAccountPage() {
  return (
    <UserGate>
      <MyAccountScreen />
    </UserGate>
  );
}
