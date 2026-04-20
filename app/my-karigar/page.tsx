import { UserGate } from "@/components/auth/user-gate";
import { MyKarigarScreen } from "@/components/screens/my-karigar-screen";

export default function MyKarigarPage() {
  return (
    <UserGate>
      <MyKarigarScreen />
    </UserGate>
  );
}
