import { Suspense } from "react";
import { ResetPasswordScreen } from "@/components/screens/reset-password-screen";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordScreen />
    </Suspense>
  );
}
