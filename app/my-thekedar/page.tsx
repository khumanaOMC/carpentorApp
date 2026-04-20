import { UserGate } from "@/components/auth/user-gate";
import { MyThekedarScreen } from "@/components/screens/my-thekedar-screen";

export default function MyThekedarPage() {
  return (
    <UserGate>
      <MyThekedarScreen />
    </UserGate>
  );
}
