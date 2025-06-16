"use client";

import nextDynamic from "next/dynamic";

const LazyCharts = nextDynamic(() => import("./AnalyticsChartsClient"), {
  ssr: false,
  loading: () => <div className="p-6">Loading charts…</div>,
});

export default function ChartsDynamic(props: any) {
  return <LazyCharts {...props} />;
} 