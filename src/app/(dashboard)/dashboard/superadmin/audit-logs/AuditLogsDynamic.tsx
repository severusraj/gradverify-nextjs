"use client";

import nextDynamic from "next/dynamic";

const LazyAuditLogsClient = nextDynamic(() => import("./AuditLogsClient"), {
  ssr: false,
  loading: () => <div className="p-6">Loading logs…</div>,
});

export default function AuditLogsDynamic(props: any) {
  return <LazyAuditLogsClient {...props} />;
} 