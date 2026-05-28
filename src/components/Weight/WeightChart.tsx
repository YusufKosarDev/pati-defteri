import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { formatDate } from "../../utils/dateHelpers";
import type { Weight } from "../../types";

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { notes?: string } }>;
  label?: string | number;
};

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0];
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-md p-3 text-sm">
        <p className="font-semibold text-gray-200">{label}</p>
        <p className="text-emerald-400 font-bold">{point.value} kg</p>
        {point.payload?.notes && (
          <p className="text-gray-500 text-xs mt-1">{point.payload.notes}</p>
        )}
      </div>
    );
  }
  return null;
}

function WeightChart({ weights }: { weights: Weight[] }) {
  const sorted = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data = sorted.map((w) => ({
    date: formatDate(w.date),
    kg: parseFloat(w.weight),
    notes: w.notes,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="kg"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default WeightChart;
