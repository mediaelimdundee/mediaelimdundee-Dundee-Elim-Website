function formatTimestamp(value) {
  if (!value) {
    return 'Unknown';
  }

  return new Date(value).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function SubmissionsPanel({
  submissions,
  typeFilter,
  statusFilter,
  onTypeFilterChange,
  onStatusFilterChange,
  onUpdateStatus,
  loading,
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Submissions</h2>
          <p className="text-white/45 text-sm mt-2">Contact form messages and prayer requests submitted from the public website.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={typeFilter} onChange={(event) => onTypeFilterChange(event.target.value)} className="rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="all" className="bg-slate-900">All Types</option>
            <option value="contact" className="bg-slate-900">Contact</option>
            <option value="prayer" className="bg-slate-900">Prayer</option>
          </select>
          <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} className="rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="all" className="bg-slate-900">All Statuses</option>
            <option value="new" className="bg-slate-900">New</option>
            <option value="read" className="bg-slate-900">Read</option>
            <option value="archived" className="bg-slate-900">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl p-8 text-center text-white/45" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl p-8 text-center text-white/45" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          No submissions match the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={`${submission.type}-${submission.id}`} className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium text-blue-200" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      {submission.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium text-white/70" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {submission.status}
                    </span>
                    {submission.isPrivate && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium text-purple-200" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)' }}>
                        Private
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg">{submission.name}</h3>
                  <div className="text-white/40 text-sm mt-1">{formatTimestamp(submission.createdAt)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {submission.status !== 'read' && (
                    <button type="button" onClick={() => onUpdateStatus(submission.type, submission.id, 'read')} className="px-3 py-2 rounded-xl text-sm text-blue-300 hover:text-white transition-colors" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      Mark Read
                    </button>
                  )}
                  {submission.status !== 'archived' && (
                    <button type="button" onClick={() => onUpdateStatus(submission.type, submission.id, 'archived')} className="px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Archive
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Email</div>
                  <div className="text-white">{submission.email || 'Not provided'}</div>
                </div>
                {submission.type === 'contact' && (
                  <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Phone</div>
                    <div className="text-white">{submission.phone || 'Not provided'}</div>
                  </div>
                )}
              </div>

              {submission.subject && (
                <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Subject</div>
                  <div className="text-white">{submission.subject}</div>
                </div>
              )}

              <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-2">{submission.type === 'contact' ? 'Message' : 'Prayer Request'}</div>
                <div className="text-white/85 whitespace-pre-line leading-relaxed">{submission.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
