import { Suspense } from "react";
import { getSuperadminAuditLogs } from "@/actions/superadmin-audit-logs.actions";
import AuditLogsDynamic from "./AuditLogsDynamic";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const pageSize = 10;
  const result = await getSuperadminAuditLogs({ page: 1, limit: pageSize });
  const initialLogs = result.success ? result.logs ?? [] : [];
  const pagination = result.pagination
    ? { totalPages: result.pagination.totalPages, total: result.pagination.total }
    : { totalPages: 1, total: initialLogs.length };

  return (
    <Suspense fallback={<div className="p-8">Loading audit logs…</div>}>
      <AuditLogsDynamic initialLogs={initialLogs} initialPagination={pagination} pageSize={pageSize} />
    </Suspense>
  );
} 