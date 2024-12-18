"use client";
import { AnalyticsCarousel } from "@/components/analytics-carousel";
import { Articles } from "@/components/articles";
import { FiisDividendsChart } from "@/components/fiis/fiis-dividends-chart";
import { FiisHomeChart } from "@/components/fiis/fiis-home-chart";

export default function Home() {
  return (
    <main className="w-[90%] mx-auto mt-6 overflow-hidden lg:w-[calc(100%-48px)] lg:max-w-[1400px]">
      <AnalyticsCarousel />
      <div className="lg:flex lg:items-start lg:gap-16 lg:mt-4 2xl:gap-24">
        <FiisHomeChart />
        <FiisDividendsChart />
      </div>
      <Articles />
    </main>
  );
}
