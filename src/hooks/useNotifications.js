import { useEffect, useState } from "react";
import i18n from "../i18n/index.js";
import { isOverdue, isUpcoming, getDaysUntil } from "../utils/dateHelpers";

function useNotifications(pets, records) {
  const isSupported = "Notification" in window;

  const [permission, setPermission] = useState(
    isSupported ? Notification.permission : "denied"
  );

  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return "denied";
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.error("Bildirim izni alınamadı:", err);
      return "denied";
    }
  };

  const sendNotification = (title, body) => {
    if (!isSupported || Notification.permission !== "granted") return;
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: title,
      });
    } catch (err) {
      console.error("Bildirim gönderilemedi:", err);
    }
  };

  const checkAndNotify = () => {
    if (!isSupported || Notification.permission !== "granted") return;

    const isEN = i18n.language === "en";
    const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
    const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate, 7));

    overdueRecords.forEach((r) => {
      const pet = pets.find((p) => p.id === r.petId);
      if (!pet) return;
      const days = Math.abs(getDaysUntil(r.nextDate));
      const title = isEN
        ? `${pet.name} - Overdue Care!`
        : `${pet.name} - Gecikmiş Bakım!`;
      const body = isEN
        ? `${r.type} is ${days} day${days !== 1 ? "s" : ""} overdue. Please contact your vet.`
        : `${r.type} için ${days} gün geçti. Lütfen veterinerinizi arayın.`;
      sendNotification(title, body);
    });

    upcomingRecords.forEach((r) => {
      const pet = pets.find((p) => p.id === r.petId);
      if (!pet) return;
      const days = getDaysUntil(r.nextDate);
      const title = isEN
        ? `${pet.name} - Upcoming Care`
        : `${pet.name} - Yaklaşan Bakım`;
      const body = isEN
        ? `${r.type} ${days === 0 ? "today!" : `in ${days} day${days !== 1 ? "s" : ""}.`}`
        : `${r.type} için ${days === 0 ? "bugün!" : `${days} gün kaldı.`}`;
      sendNotification(title, body);
    });
  };

  useEffect(() => {
    if (permission !== "granted") return;
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [permission, records]);

  return { permission, requestPermission, checkAndNotify, isSupported };
}

export default useNotifications;
