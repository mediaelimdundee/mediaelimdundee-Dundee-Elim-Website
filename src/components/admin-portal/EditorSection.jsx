// @ts-nocheck
export default function EditorSection({ title, description, children }) {
  return (
    <section className="admin-surface">
      <div className="border-b border-[#e6eaf1] px-6 py-5 lg:px-7">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-4 px-6 py-5 lg:px-7">{children}</div>
    </section>
  );
}
