interface SuiteCardExtendsSectionProps {
  label?: string;
}

export function SuiteCardExtendsSection({
  label,
}: SuiteCardExtendsSectionProps) {
  return (
    <div>
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
        Extends
      </span>
      <div>
        <span className="text-sm italic text-slate-400">{label ?? "none"}</span>
      </div>
    </div>
  );
}
