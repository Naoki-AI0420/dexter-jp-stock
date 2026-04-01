import { Card, CardContent } from "@/components/ui/card";

interface FinancialRow {
  label: string;
  value: string;
}

export function FinancialTable({ title, rows }: { title: string; rows: FinancialRow[] }) {
  return (
    <Card>
      <CardContent>
        <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-3 text-sm">
              <span className="text-slate-300">{row.label}</span>
              <span className="font-medium text-white">{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
