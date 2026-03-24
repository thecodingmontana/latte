import Image from "next/image";
import { getBlurData } from "@/lib/get-image-blur";

export default async function Home() {
  const blurDataURL = await getBlurData(
    "/images/finance-investment-banking-cost-concept.webp"
  );
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-neutral-950">
      <section className="relative min-h-screen w-full overflow-hidden bg-gray-100 [--pattern:var(--color-neutral-300)] dark:bg-neutral-950 dark:[--pattern:var(--color-neutral-800)]">
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center">
          {/* Background Pattern Borders */}
          <div className="absolute top-0 mx-auto h-6 w-screen border-[--pattern] border-y bg-[repeating-linear-gradient(315deg,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_50%)] bg-size-[8px_8px] md:h-10 md:bg-size-[10px_10px]" />
          <div className="absolute bottom-0 mx-auto h-6 w-screen border-[--pattern] border-y bg-[repeating-linear-gradient(315deg,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_50%)] bg-size-[8px_8px] md:h-10 md:bg-size-[10px_10px]" />
          <div className="absolute left-0 mx-auto h-full w-6 border-[--pattern] border-x bg-[repeating-linear-gradient(315deg,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_50%)] bg-size-[8px_8px] md:w-10 md:bg-size-[10px_10px]" />
          <div className="absolute right-0 mx-auto h-full w-6 border-[--pattern] border-x bg-[repeating-linear-gradient(315deg,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_50%)] bg-size-[8px_8px] md:w-10 md:bg-size-[10px_10px]" />

          <div className="size-full p-6 md:p-10">
            <div className="relative flex min-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden bg-white shadow-2xl sm:min-h-[calc(100dvh-3rem)] md:min-h-[calc(100dvh-5rem)] dark:bg-neutral-900">
              {/* Top decorative bar */}
              <div className="absolute inset-x-0 top-0 h-10 w-full bg-[repeating-linear-gradient(to_bottom,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_0.5rem)] md:h-14" />

              {/* Hero Background Image - Optimized with Next.js Image */}
              <Image
                alt="Hero Section with Shadow and Scales"
                blurDataURL={blurDataURL}
                className="mask-t-from-50% mask-b-from-10% mask-b-to-80% absolute inset-0 h-full w-full object-cover"
                fill
                placeholder="blur"
                priority
                quality={75}
                sizes="100vw"
                src="/images/finance-investment-banking-cost-concept.webp"
              />

              {/* Main Content */}
              <div className="relative z-20 flex flex-1 flex-col justify-between">
                {/* Navbar */}
                <nav
                  aria-label="Main navigation"
                  className="relative flex w-full items-center justify-between px-4 py-2 sm:px-6 md:px-8 md:py-4"
                >
                  <span className="bg-linear-to-b from-blue-200 to-blue-800 bg-clip-text font-bold text-lg text-transparent tracking-tighter sm:text-xl">
                    Latte
                  </span>

                  {/* Desktop Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white text-xs shadow transition hover:bg-blue-700"
                      type="button"
                    >
                      Get Started
                    </button>
                  </div>
                </nav>

                {/* Hero Content */}
                <div className="px-4 pt-4 pb-10 sm:px-6 sm:pt-8 sm:pb-12 md:px-8 md:py-12">
                  <h1 className="max-w-4xl font-medium text-3xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    The personal finance app for everyone.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base text-neutral-500 tracking-tighter sm:mt-6 sm:text-lg md:mt-8 md:text-xl lg:text-2xl dark:text-neutral-300">
                    Latte helps you track every expense, understand your
                    spending, and stay in control of your finances — beautifully
                    simple.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-2">
                    <button
                      className="rounded-md bg-linear-to-t from-blue-600 to-blue-500 px-6 py-3 font-semibold text-sm text-white shadow transition hover:brightness-105 sm:py-3"
                      type="button"
                    >
                      Get started for free today
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom decorative bar */}
              <div className="absolute inset-x-0 bottom-0 h-10 w-full bg-[repeating-linear-gradient(to_bottom,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_0.5rem)] md:h-14" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
