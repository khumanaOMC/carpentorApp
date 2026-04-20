import { AppEntryGate } from "@/components/onboarding/app-entry-gate";
import { HomeScreen } from "@/components/screens/home-screen";

export default function HomePage() {
  return (
    <AppEntryGate>
      <HomeScreen />
    </AppEntryGate>
  );
}
