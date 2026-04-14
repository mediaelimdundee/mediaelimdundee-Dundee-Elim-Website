// @ts-nocheck
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-[2.15rem]">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-[0.95rem]">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-start gap-2 xl:justify-end">{children}</div> : null}
    </div>
  );
}
