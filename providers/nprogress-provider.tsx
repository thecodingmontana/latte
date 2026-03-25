import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useCallback, useEffect, useRef, useState } from "react";

NProgress.configure({
  showSpinner: false,
  speed: 400,
  minimum: 0.3,
  trickleSpeed: 150,
});

export default function NprogressProvider() {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const timersRef = useRef<{
    safety?: NodeJS.Timeout;
    complete?: NodeJS.Timeout;
    load?: NodeJS.Timeout;
  }>({});
  const routerInterceptedRef = useRef(false);

  const clearTimers = useCallback(() => {
    Object.values(timersRef.current).forEach((timer) => {
      if (timer) {
        clearTimeout(timer);
      }
    });
    timersRef.current = {};
  }, []);

  // Extract pathname without query params
  const getPathnameOnly = useCallback((url: string): string => {
    if (typeof url !== "string") {
      return "";
    }
    const urlWithoutHash = url.split("#")[0] || "";
    return urlWithoutHash.split("?")[0] || "";
  }, []);

  // Handle initial page load
  useEffect(() => {
    if (isInitialLoad) {
      NProgress.start();
      timersRef.current.load = setTimeout(() => {
        NProgress.done();
        setIsInitialLoad(false);
      }, 800);

      return () => {
        clearTimers();
        NProgress.done();
      };
    }
  }, [isInitialLoad, clearTimers]);

  // Handle route changes
  useEffect(() => {
    if (isInitialLoad) {
      return;
    }

    const currentPathOnly = getPathnameOnly(pathname);
    const previousPathOnly = getPathnameOnly(pathnameRef.current);

    // Only start progress if the actual route changed (ignore query params)
    if (previousPathOnly !== currentPathOnly) {
      clearTimers();
      NProgress.start();

      // Safety timeout for very slow loads
      timersRef.current.safety = setTimeout(() => {
        NProgress.done();
      }, 8000);

      // Complete after navigation
      timersRef.current.complete = setTimeout(() => {
        NProgress.done();
        if (timersRef.current.safety) {
          clearTimeout(timersRef.current.safety);
          timersRef.current.safety = undefined;
        }
      }, 1200);

      pathnameRef.current = pathname;

      return () => {
        clearTimers();
        NProgress.done();
      };
    }
    // Update ref even if path didn't change (query params changed)
    pathnameRef.current = pathname;
  }, [pathname, isInitialLoad, clearTimers, getPathnameOnly]);

  // Intercept router methods (only once)
  useEffect(() => {
    if (routerInterceptedRef.current) {
      return;
    }
    routerInterceptedRef.current = true;

    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    router.push = (href: any, options?: any) => {
      const targetPath = typeof href === "string" ? href : href?.pathname || "";
      const targetPathOnly = getPathnameOnly(targetPath);
      const currentPathOnly = getPathnameOnly(pathname);

      // Only start progress if navigating to a different route (ignore query params)
      if (targetPathOnly !== currentPathOnly) {
        NProgress.start();
      }
      return originalPush(href, options);
    };

    router.replace = (href: any, options?: any) => {
      const targetPath = typeof href === "string" ? href : href?.pathname || "";
      const targetPathOnly = getPathnameOnly(targetPath);
      const currentPathOnly = getPathnameOnly(pathname);

      // Only start progress if navigating to a different route (ignore query params)
      if (targetPathOnly !== currentPathOnly) {
        NProgress.start();
      }
      return originalReplace(href, options);
    };

    router.back = () => {
      NProgress.start();
      return originalBack.apply(router);
    };

    router.forward = () => {
      NProgress.start();
      return originalForward.apply(router);
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;
      routerInterceptedRef.current = false;
    };
  }, [router, pathname, getPathnameOnly]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
      NProgress.done();
    };
  }, [clearTimers]);

  return null;
}
