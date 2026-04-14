// @ts-nocheck
export default function StatusBadge({ status = 'draft' }) {
  const toneByStatus = {
    draft: {
      label: 'Draft',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      dotClassName: 'bg-amber-500',
    },
    ready: {
      label: 'Ready',
      className: 'border-blue-200 bg-blue-50 text-blue-700',
      dotClassName: 'bg-blue-500',
    },
    published: {
      label: 'Published',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dotClassName: 'bg-emerald-500',
    },
  };
  const tone = toneByStatus[status] || toneByStatus.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dotClassName}`} />
      {tone.label}
    </span>
  );
}
