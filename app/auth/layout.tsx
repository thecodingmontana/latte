import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex bg-white dark:bg-zinc-950">
      <div className="absolute top-3 right-3">
        <ThemeToggle className="rounded-full" />
      </div>
      {children}
    </main>
  );
}
