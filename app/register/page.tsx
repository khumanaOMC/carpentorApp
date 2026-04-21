import { Suspense } from "react";
import { RegisterScreen } from "@/components/screens/register-screen";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterScreen />
    </Suspense>
  );
}
