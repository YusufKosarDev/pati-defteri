import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { formatDate } from "../../utils/dateHelpers";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-md p-3 text-sm">
        <p className="font-semibold text-gray-200">{label}</p>
        <p className="text-emerald-400 font-bold">{payload[0].value} kg</p>
        {payload[0]?.payload?.notes && (
          <p className="text-gray-500 text-xs mt-1">{payload[0].payload.notes}</p>
        )}
      </div>
    );
  }
  return null;
}

function WeightChart({ weights }) {
  const sorted = [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));

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