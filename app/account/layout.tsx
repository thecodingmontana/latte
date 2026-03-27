import { redirect } from "next/navigation";
import { get2FARedirect } from "@/lib/server/2fa";
import { globalGETRateLimit } from "@/lib/server/requests";
import { getCurrentSession } from "@/lib/server/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!globalGETRateLimit()) {
    return "Too many requests";
  }

  const { session, user } = await getCurrentSession();

  if (session === null) {
    return redirect("/login");
  }

  if (user.registered_2fa && !session.two_factor_verified) {
    return redirect(get2FARedirect(user));
  }

  return <div>{children}</div>;
}
