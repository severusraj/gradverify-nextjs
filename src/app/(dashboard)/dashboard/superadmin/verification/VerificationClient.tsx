"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Dynamically import the large component without SSR to reduce server bundle
const OriginalComponent = dynamic(() => import("./VerificationContent"), { ssr: false }) as ComponentType<any>;

export default function VerificationClient(props: any) {
  return <OriginalComponent {...props} />;
} 