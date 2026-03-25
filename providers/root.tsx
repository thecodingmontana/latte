"use client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NprogressProvider from "./nprogress-provider";
import { ThemeProvider } from "./theme-provider";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NprogressProvider />
      <Toaster
        closeButton
        richColors
        style={{ fontFamily: "var(--font-bricolage)" }}
      />
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
