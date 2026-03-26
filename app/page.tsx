import Image from "next/image";
import Header from "@/components/home/header";
import HeroContent from "@/components/home/hero-content";
import { getBlurData } from "@/lib/get-image-blur";

export default async function Home() {
  const blurDataURL = await getBlurData(
    "/images/finance-investment-banking-cost-concept.webp"
  );
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-neutral-950">
      <section className="relative min-h-screen w-full overflow-hidden bg-brand-10 [--pattern:var(--color-neutral-300)] dark:bg-neutral-950 dark:[--pattern:var(--color-neutral-800)]">
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center">
          {/* Background Pattern Borders */}
          <div className="absolute top-0 mx-auto h-6 w-screen border-[--pattern] border-y bg-[repeating-linear-gradient(315deg,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_50%)] bg-size-[8px_8px] md:h-10 md:bg-size-[10px_10px]" />
          <div className="absolute bottom-0 mx-auto h-6 w-screen border-[--pattern] border-y bg-[repeating-linear-gradient(315deg,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_50%)] bg-size-[8px_8px] md:h-10 md:bg-size-[10px_10px]" />
          <div className="absolute left-0 mx-auto h-full w-6 border-[--pattern] border-x bg-[repeating-linear-gradient(315deg,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_50%)] bg-size-[8px_8px] md:w-10 md:bg-size-[10px_10px]" />
          <div className="absolute right-0 mx-auto h-full w-6 border-[--pattern] border-x bg-[repeating-linear-gradient(315deg,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_50%)] bg-size-[8px_8px] md:w-10 md:bg-size-[10px_10px]" />

          <div className="size-full p-6 md:p-10">
            <div className="relative flex min-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden bg-brand/10 shadow-2xl sm:min-h-[calc(100dvh-3rem)] md:min-h-[calc(100dvh-5rem)] dark:bg-neutral-900">
              {/* Hero Background Image */}
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

              {/* Top decorative bar */}
              <div className="mask-[linear-gradient(to_bottom,black,transparent)] absolute inset-x-0 top-0 z-10 h-10 w-full bg-[repeating-linear-gradient(to_bottom,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_0.5rem)] md:h-14" />

              {/* Bottom decorative bar */}
              <div className="mask-[linear-gradient(to_top,black,transparent)] absolute inset-x-0 bottom-0 z-10 h-10 w-full bg-[repeating-linear-gradient(to_bottom,var(--pattern)_0,var(--pattern)_1px,transparent_1px,transparent_0.5rem)] md:h-14" />

              {/* Main Content */}
              <div className="relative z-20 flex flex-1 flex-col justify-between">
                {/* ✅ Animated Header */}
                <Header />
                <HeroContent />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
