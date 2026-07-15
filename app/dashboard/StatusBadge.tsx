export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-teal-50 text-teal-700",
    active: "bg-teal-50 text-teal-700",
    paid: "bg-teal-50 text-teal-700",
    shipped: "bg-violet-50 text-violet-700",
    delivered: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
    revoked: "bg-rose-50 text-rose-700",
    banned: "bg-rose-50 text-rose-700",
    restricted: "bg-amber-50 text-amber-700",
    cancelled: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}