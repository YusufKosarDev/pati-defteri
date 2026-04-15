import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { formatDate } from "../../utils/dateHelpers";

function WeightChart({ weights }) {
  const sorted = [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));

  const data = sorted.map((w) => ({
    date: formatDate(w.date),
    kg: parseFloat(w.weight),
    notes: w.notes,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-md p-3 text-sm">
          <p className="font-semibold text-gray-700">{label}</p>
          <p className="text-emerald-600 font-bold">{payload[0].value} kg</p>
          {payload[0]?.payload?.notes && (
            <p className="text-gray-400 text-xs mt-1">{payload[0].payload.notes}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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