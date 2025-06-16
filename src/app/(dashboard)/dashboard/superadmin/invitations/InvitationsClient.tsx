"use client";

import nextDynamic from "next/dynamic";

const LazyInvitations = nextDynamic(() => import("./InvitationsContent"), {
  ssr: false,
  loading: () => <div className="p-6">Loading invitations…</div>,
});

export default function InvitationsClient(props: any) {
  return <LazyInvitations {...props} />;
} 