import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../hooks/usePet";
import usePageTitle from "../hooks/usePageTitle";
import { recordTypeLabel, type RecordTypeKey } from "../utils/recordTypes";
import type { Id } from "../../convex/_generated/dataModel";

const RECORD_ICONS: Record<RecordTypeKey, string> = {
  mixed_vaccine: "💉",
  rabies: "🛡️",
  parasite_drop: "💧",
  flea: "🪲",
  dewormer: "🪱",
  vet_visit: "🏥",
  other: "📋",
};

function CalendarPage() {
  const { pets, records } = usePet();
  const { t, i18n } = useTranslation();
  const isEN = i18n.language === "en";

  usePageTitle(t("navCalendar"));

  const MONTHS = t("calendarMonths").split(",");
  const DAYS = t("calendarDays").split(",");

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const totalDays = lastDay.getDate();
  const cells: { key: string; day: number | null }[] = [];
  for (let i = 0; i < startOffset; i++) cells.push({ key: `lead-${i}`, day: null });
  for (let d = 1; d <= totalDays; d++) cells.push({ key: `${year}-${month}-${d}`, day: d });

  const getRecordsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return records.filter((r) => r.nextDate === dateStr || r.date === dateStr);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(today.getDate());
  };

  const selectedRecords = selectedDay ? getRecordsForDay(selectedDay) : [];

  const monthRecords = records.filter((r) => {
    const checkDate = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === month && d.getFullYear() === year;
    };
    return checkDate(r.nextDate) || checkDate(r.date);
  }).sort((a, b) => new Date(a.nextDate || a.date).getTime() - new Date(b.nextDate || b.date).getTime());

  const getPetName = (petId: Id<"pets">) => pets.find((p) => p.id === petId)?.name || "";

  const getPetAvatar = (petId: Id<"pets">) => {
    const pet = pets.find((p) => p.id === petId);
    if (!pet) return null;
    const colors = ["bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-pink-500", "bg-orange-500"];
    const color = colors[(pet.name?.charCodeAt(0) ?? 0) % colors.length];
    return { initial: pet.name?.charAt(0).toUpperCase(), color };
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{t("calendarTitle")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("calendarSubtitle")}</p>
          </div>
          <button
            onClick={goToday}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer"
          >
            {t("calendarToday")}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-gray-100 transition-colors cursor-pointer">←</button>
                <h2 className="text-base font-bold text-gray-100">{MONTHS[month]} {year}</h2>
                <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-gray-100 transition-colors cursor-pointer">→</button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map(({ key, day }) => {
                  if (!day) return <div key={key} />;
                  const dayRecords = getRecordsForDay(day);
                  const hasRecords = dayRecords.length > 0;
                  const todayClass = isToday(day);
                  const pastClass = isPast(day);
                  const isSelected = selectedDay === day;

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : todayClass
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : pastClass
                          ? "text-gray-600"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      {day}
                      {hasRecords && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayRecords.slice(0, 3).map((r) => (
                            <div key={r.id} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedDay && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border-t border-gray-800 pt-4 overflow-hidden"
                  >
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {t("calendarDayRecords", { day: selectedDay, month: MONTHS[month], count: selectedRecords.length })}
                    </p>
                    {selectedRecords.length === 0 ? (
                      <p className="text-sm text-gray-600 text-center py-2">{t("calendarNoDayRecords")}</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selectedRecords.map((r) => {
                          const avatar = getPetAvatar(r.petId);
                          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
                          const isNextDate = r.nextDate === dateStr;
                          return (
                            <div key={r.id} className="flex items-center gap-3 bg-gray-800 rounded-xl px-3 py-2">
                              {avatar && (
                                <div className={`w-7 h-7 ${avatar.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                  {avatar.initial}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-100">{RECORD_ICONS[r.type] || "📋"} {recordTypeLabel(r.type, isEN)}</p>
                                <p className="text-xs text-gray-500">{getPetName(r.petId)}</p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isNextDate ? "bg-yellow-500/10 text-yellow-400" : "bg-blue-500/10 text-blue-400"}`}>
                                {isNextDate ? t("calendarBadgeNext") : t("calendarBadgeDone")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-5"
            >
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {t("calendarRecordsHeader", { month: MONTHS[month] })}
              </h3>
              {monthRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-sm">{t("calendarNoRecords")}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
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
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          isPastRecord && isNextDate
                            ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                            : isNextDate
                            ? "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10"
                            : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                        }`}
                        onClick={() => { setCurrentDate(new Date(year, month, 1)); setSelectedDay(d.getDate()); }}
                      >
                        {avatar && (
                          <div className={`w-7 h-7 ${avatar.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {avatar.initial}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-100 truncate">{RECORD_ICONS[r.type] || "📋"} {recordTypeLabel(r.type, isEN)}</p>
                          <p className="text-xs text-gray-500">{getPetName(r.petId)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-gray-300">{d.getDate()}</p>
                          <p className="text-xs text-gray-500">{MONTHS[d.getMonth()]?.slice(0, 3)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-4"
            >
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t("calendarLegend")}</h3>
              <div className="flex flex-col gap-2">
                {[
                  { color: "bg-emerald-500", label: t("calendarLegendToday") },
                  { color: "bg-yellow-500", label: t("calendarLegendUpcoming") },
                  { color: "bg-red-500", label: t("calendarLegendOverdue") },
                  { color: "bg-blue-500", label: t("calendarLegendCompleted") },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
