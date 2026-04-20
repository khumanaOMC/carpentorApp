import { UserGate } from "@/components/auth/user-gate";
import { BookingsScreen } from "@/components/screens/bookings-screen";

export default function BookingsPage() {
  return (
    <UserGate>
      <BookingsScreen />
    </UserGate>
  );
}
