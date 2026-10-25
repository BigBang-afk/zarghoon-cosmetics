const STYLES: Record<string, string> = {
  ACTIVE: "bg-juniper-light text-juniper",
  DRAFT: "bg-stone-200 text-stone-700",
  ARCHIVED: "bg-amber-50 text-amber-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status] ?? "bg-stone-100"}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
