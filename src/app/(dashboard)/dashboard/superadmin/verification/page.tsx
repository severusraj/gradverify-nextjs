import { Suspense } from "react";
import VerificationClient from "./VerificationClient";

export const dynamic = "force-dynamic";

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading verification UI…</div>}>
      <VerificationClient />
    </Suspense>
  );
}

