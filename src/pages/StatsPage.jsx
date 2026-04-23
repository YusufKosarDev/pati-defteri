import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import { usePet } from "../context/PetContext";
import { isOverdue, isUpcoming, getDaysUntil } from "../utils/dateHelpers";
import usePageTitle from "../hooks/usePageTitle";
import Navbar from "../components/Layout/Navbar";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#f97316"];

function StatsPage() {
  const { pets, records, weights } = usePet();
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";

  usePageTitle(isEN ? "Statistics" : "İstatistikler");

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs">
          <p className="text-gray-300 font-medium mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-medium">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Aylık kayıt verisi (son 12 ay)
  const monthlyData = () => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString(isEN ? "en-US" : "tr-TR", { month: "short" });
      const count = records.filter((r) => {
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: monthName, count });
    }
    return months;
  };

  // Kayıt türü dağılımı
  const typeData = () => {
    const types = {};
    records.forEach((r) => {
      types[r.type] = (types[r.type] || 0) + 1;
    });
    return Object.entries(types)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Hayvan başına kayıt sayısı
  const petRecordsData = () => {
    return pets.map((pet) => ({
      name: pet.name,
      records: records.filter((r) => r.petId === pet.id).length,
      overdue: records.filter((r) => r.petId === pet.id && r.nextDate && isOverdue(r.nextDate)).length,
      upcoming: records.filter((r) => r.petId === pet.id && r.nextDate && isUpcoming(r.nextDate)).length,
    }));
  };

  // Ağırlık trendi
  const weightTrendData = () => {
    if (weights.length === 0) return [];
    const allDates = [...new Set(weights.map((w) => w.date))].sort();
    return allDates.slice(-12).map((date) => {
      const entry = {
        date: new Date(date).toLocaleDateString(isEN ? "en-US" : "tr-TR", { month: "short", day: "numeric" }),
      };
      pets.forEach((pet) => {
        const w = weights.find((w) => w.petId === pet.id && w.date === date);
        if (w) entry[pet.name] = parseFloat(w.weight);
      });
      return entry;
    });
  };

  // Özet istatistikler
  const summaryStats = [
    {
      icon: "🐾",
      label: isEN ? "Total Pets" : "Toplam Hayvan",
      value: pets.length,
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      icon: "💉",
      label: isEN ? "Total Records" : "Toplam Kayıt",
      value: records.length,
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      icon: "⚠️",
      label: isEN ? "Overdue" : "Gecikmiş",
      value: records.filter((r) => r.nextDate && isOverdue(r.nextDate)).length,
      color: "bg-red-500/10 text-red-400",
    },
    {
      icon: "⏰",
      label: isEN ? "Upcoming (30d)" : "Yaklaşan (30g)",
      value: records.filter((r) => r.nextDate && isUpcoming(r.nextDate)).length,
      color: "bg-yellow-500/10 text-yellow-400",
    },
    {
      icon: "⚖️",
      label: isEN ? "Weight Records" : "Ağırlık Kaydı",
      value: weights.length,
      color: "bg-violet-500/10 text-violet-400",
    },
    {
      icon: "📅",
      label: isEN ? "This Month" : "Bu Ay",
      value: records.filter((r) => {
        const d = new Date(r.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      color: "bg-pink-500/10 text-pink-400",
    },
  ];

  const ChartCard = ({ title, children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-900 rounded-2xl border border-gray-800 p-5"
    >
      <h3 className="text-sm font-bold text-gray-300 mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-400 text-lg font-medium">
            {isEN ? "No data yet. Add pets and records to see statistics." : "Henüz veri yok. İstatistikleri görmek için hayvan ve kayıt ekleyin."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Başlık */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-100">
            📊 {isEN ? "Statistics" : "İstatistikler"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isEN ? "Overview of all your pet care data." : "Tüm evcil hayvan bakım verilerinizin özeti."}
          </p>
        </motion.div>

        {/* Özet Kartlar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {summaryStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${s.color} rounded-2xl border border-gray-800 p-4 flex items-center gap-3`}
            >
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs opacity-70">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Grafikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Aylık Kayıt Grafiği */}
          <ChartCard title={isEN ? "📈 Monthly Records (Last 12 Months)" : "📈 Aylık Kayıtlar (Son 12 Ay)"} delay={0.1}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name={isEN ? "Records" : "Kayıt"}
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#emeraldGradient)"
                    dot={{ fill: "#10b981", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Kayıt Türü Dağılımı */}
          <ChartCard title={isEN ? "🥧 Record Type Distribution" : "🥧 Kayıt Türü Dağılımı"} delay={0.15}>
            <div className="h-56 flex items-center gap-4">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {typeData().map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-48">
                {typeData().map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-300 truncate flex-1">{item.name}</span>
                    <span className="text-gray-500 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Hayvana Göre Kayıt */}
          <ChartCard title={isEN ? "🐾 Records Per Pet" : "🐾 Hayvana Göre Kayıt"} delay={0.2}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={petRecordsData()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
                  <Bar dataKey="records" name={isEN ? "Total" : "Toplam"} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overdue" name={isEN ? "Overdue" : "Gecikmiş"} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="upcoming" name={isEN ? "Upcoming" : "Yaklaşan"} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Ağırlık Trendi */}
          <ChartCard title={isEN ? "⚖️ Weight Trend" : "⚖️ Ağırlık Trendi"} delay={0.25}>
            <div className="h-56">
              {weights.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightTrendData()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
                    {pets.map((pet, i) => (
                      <Line
                        key={pet.id}
                        type="monotone"
                        dataKey={pet.name}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                  {isEN ? "No weight records yet." : "Henüz ağırlık kaydı yok."}
                </div>
              )}
            </div>
          </ChartCard>

        </div>
      </div>
    </div>
  );
}

export default StatsPage;