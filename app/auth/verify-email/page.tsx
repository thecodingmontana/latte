import { redirect } from "next/navigation";
import { globalGETRateLimit } from "@/lib/server/requests";
import { getCurrentSession } from "@/lib/server/session";

export default async function VerifyEmailPage() {
  if (!(await globalGETRateLimit())) {
    return "Too many requests";
  }

  const { session, user } = await getCurrentSession();

  if (session === null) {
    return redirect("/auth/signin");
  }

  if (user.email_verified) {
    if (!session.two_factor_verified) {
      return redirect("/auth/reset-password/2fa");
    }
    return redirect("/auth/reset-password");
  }
  return <div>Verify Email</div>;
}
