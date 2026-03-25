import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IconGoogle } from "@/components/svgs/icons/google";
import { detectBrowser } from "@/lib/detect-browser";
import { cn } from "@/lib/utils";

type AuthProvider = "google";

interface OauthButtonProps {
  isAuthenticating: boolean;
}

interface OauthButton {
  icon: React.ReactNode;
  provider: AuthProvider;
  text: string;
}

function getStoreSlug(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  if (process.env.NODE_ENV === "production") {
    // sneakers.goodsncart.com → ["sneakers", "goodsncart", "com"]
    if (parts.length === 3 && parts[1] === "goodsncart") {
      return parts[0] ?? null;
    }
    return null;
  }

  // Dev: sneakers.localhost → ["sneakers", "localhost"]
  if (parts.length === 2 && parts[1] === "localhost") {
    return parts[0] ?? null;
  }

  return null;
}

export default function OauthProviders({ isAuthenticating }: OauthButtonProps) {
  const authProviders = useMemo<OauthButton[]>(
    () => [
      {
        provider: "google",
        text: "Continue with Google",
        icon: <IconGoogle />,
      },
    ],
    []
  );

  const [isOauthAuthentication, setIsOauthAuthentication] = useState(false);

  const handleOauthLogin = useCallback(
    async (provider: AuthProvider) => {
      if (isAuthenticating || isOauthAuthentication) return;
      setIsOauthAuthentication(true);

      try {
        if (provider === "google") {
          const clientBrowser = await detectBrowser();

          const url = new URL("/customers/auth/oauth/google");

          console.log("url", url);

          const storeSlug = getStoreSlug();
          if (storeSlug) {
            url.searchParams.set("store", storeSlug);
          }

          url.searchParams.set("browser", clientBrowser);

          window.location.assign(url.toString());
        }
      } catch (error) {
        console.error("OAuth initialization failed:", error);
        setIsOauthAuthentication(false);
      }
    },
    [isAuthenticating, isOauthAuthentication]
  );

  useEffect(() => {
    const handleOauthResponse = (event: MessageEvent) => {
      if (event.data === "oauth-success") {
        setIsOauthAuthentication(false);
      } else if (event.data === "oauth-failure") {
        setIsOauthAuthentication(false);
      }
    };

    window.addEventListener("message", handleOauthResponse);
    return () => window.removeEventListener("message", handleOauthResponse);
  }, []);

  return (
    <div className="grid gap-2 overflow-hidden">
      <div className="overflow-hidden! flex h-10.5 items-center">
        {authProviders.map((auth) => {
          const isButtonDisabled = isAuthenticating || isOauthAuthentication;
          return (
            <button
              aria-label={`${auth.text} - OAuth authentication`}
              className={cn(
                "flex h-10.5 w-full items-center justify-center gap-2 rounded-[10px] border px-2 font-medium text-sm transition-colors duration-200 hover:border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-offset-1",
                isButtonDisabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              )}
              disabled={isButtonDisabled}
              key={auth.provider}
              onClick={() => handleOauthLogin(auth.provider)}
              type="button"
            >
              {isOauthAuthentication ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                auth.icon
              )}
              {auth.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
