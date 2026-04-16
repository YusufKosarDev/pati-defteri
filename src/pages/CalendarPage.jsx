import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";
import { formatDate } from "../utils/dateHelpers";
import Navbar from "../components/Layout/Navbar";

const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const RECORD_ICONS = {
  "Karma Aşı": "💉",
  "Kuduz Aşısı": "🛡️",
  "Parazit Damlası": "💧",
  "Pire İlacı": "🪲",
  "Kurtluk İlacı": "🪱",
  "Veteriner Ziyareti": "🏥",
  "Diğer": "📋",
};

function CalendarPage() {
  const { pets, records } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const MONTHS = isEN ? MONTHS_EN : MONTHS_TR;
  const DAYS = isEN ? DAYS_EN : DAYS_TR;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Pazartesi başlangıçlı haftaya göre ayar
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const totalDays = lastDay.getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let i = 1; i <= totalDays; i++) cells.push(i);

  // Kayıtları tarihe göre grupla
  const getRecordsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return records.filter((r) => r.nextDate === dateStr || r.date === dateStr);
  };

  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isPast = (day) => {
    const d = new Date(year, month, day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedRecords = selectedDay ? getRecordsForDay(selectedDay) : [];

  // Bu aydaki tüm kayıtları listele
  const monthRecords = records.filter((r) => {
    const checkDate = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === month && d.getFullYear() === year;
    };
    return checkDate(r.nextDate) || checkDate(r.date);
  }).sort((a, b) => {
    const dateA = new Date(a.nextDate || a.date);
    const dateB = new Date(b.nextDate || b.date);
    return dateA - dateB;
  });

  const getPetName = (petId) => pets.find((p) => p.id === petId)?.name || "";
  const getPetAvatar = (petId) => {
    const pet = pets.find((p) => p.id === petId);
    if (!pet) return null;
    const colors = ["bg-emerald-400", "bg-sky-400", "bg-violet-400", "bg-pink-400", "bg-orange-400"];
    const color = colors[pet.name?.charCodeAt(0) % colors.length];
    return { initial: pet.name?.charAt(0).toUpperCase(), color };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            📅 {isEN ? "Vaccine Calendar" : "Aşı Takvimi"}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {isEN ? "Monthly view of all upcoming care and vaccinations." : "Tüm yaklaşan bakım ve aşıların aylık görünümü."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sol — Takvim */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
            >
              {/* Ay navigasyonu */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  ←
                </button>
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
                  {MONTHS[month]} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  →
                </button>
              </div>

              {/* Gün başlıkları */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Günler */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const dayRecords = getRecordsForDay(day);
                  const hasRecords = dayRecords.length > 0;
                  const todayClass = isToday(day);
                  const pastClass = isPast(day);
                  const isSelected = selectedDay === day;

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500 text-white shadow-md"
                          : todayClass
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500"
                          : pastClass
                          ? "text-gray-300 dark:text-gray-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {day}
                      {hasRecords && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayRecords.slice(0, 3).map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Seçili gün detayı */}
              <AnimatePresence>
                {selectedDay && selectedRecords.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4"
                  >
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                      {selectedDay} {MONTHS[month]} — {selectedRecords.length} {isEN ? "record" : "kayıt"}
                    </p>
                    <div className="flex flex-col gap-2">
                      {selectedRecords.map((r) => {
                        const avatar = getPetAvatar(r.petId);
                        const isNextDate = r.nextDate === `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
                        return (
                          <div key={r.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                            {avatar && (
                              <div className={`w-7 h-7 ${avatar.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                {avatar.initial}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {RECORD_ICONS[r.type] || "📋"} {r.type}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{getPetName(r.petId)}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              isNextDate
                                ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400"
                                : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                            }`}>
                              {isNextDate ? (isEN ? "Next" : "Sonraki") : (isEN ? "Done" : "Yapıldı")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                {selectedDay && selectedRecords.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4 text-center text-sm text-gray-400 dark:text-gray-500"
                  >
                    {isEN ? "No records for this day." : "Bu gün için kayıt yok."}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sağ — Bu aydaki kayıtlar */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
            >
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                {MONTHS[month]} {isEN ? "Records" : "Kayıtları"}
              </h3>

              {monthRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-sm">{isEN ? "No records this month." : "Bu ay kayıt yok."}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {monthRecords.map((r) => {
                    const avatar = getPetAvatar(r.petId);
                    const date = r.nextDate || r.date;
                    const d = new Date(date);
                    const isNextDate = !!r.nextDate;
                    const isPastRecord = d < today;

                    return (
                      <motion.div
                        key={r.id + (isNextDate ? "-next" : "-done")}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                          isPastRecord && isNextDate
                            ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900"
                            : isNextDate
                            ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                        }`}
                        onClick={() => {
                          setCurrentDate(new Date(year, month, 1));
                          setSelectedDay(d.getDate());
                        }}
                      >
                        {avatar && (
                          <div className={`w-7 h-7 ${avatar.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {avatar.initial}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {RECORD_ICONS[r.type] || "📋"} {r.type}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{getPetName(r.petId)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{d.getDate()}</p>
                          <p className="text-xs text-gray-400">{MONTHS[d.getMonth()].slice(0, 3)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm mt-4"
            >
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                {isEN ? "Legend" : "Açıklama"}
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  {isEN ? "Today" : "Bugün"}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  {isEN ? "Upcoming" : "Yaklaşan"}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  {isEN ? "Overdue" : "Gecikmiş"}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  {isEN ? "Completed" : "Tamamlandı"}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;