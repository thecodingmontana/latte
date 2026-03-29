import { redirect } from "next/navigation";
import SignupWrapper from "@/components/auth/signup/signup-wrapper";
import { get2FARedirect } from "@/lib/server/2fa";
import { globalGETRateLimit } from "@/lib/server/requests";
import { getCurrentSession } from "@/lib/server/session";

export default async function SignupPage() {
  if (!(await globalGETRateLimit())) {
    return "Too many requests";
  }

  const { session, user } = await getCurrentSession();

  if (session !== null) {
    if (!user.email_verified) {
      return redirect("/auth/verify-email");
    }
    if (!user.registered_2fa) {
      return redirect("/auth/2fa/setup");
    }
    if (!session.two_factor_verified) {
      return redirect(get2FARedirect(user));
    }
    return redirect("/account/dashboard");
  }

  return (
    <div className="flex h-screen flex-1 items-center">
      <SignupWrapper />
    </div>
  );
}
