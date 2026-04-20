import { isOverdue, isUpcoming, getDaysUntil, formatDate } from "../utils/dateHelpers";

function useEmailReminder(pets, records) {

  const sendReminderEmail = async (toEmail, userName) => {
    if (!toEmail) return { success: false, error: "E-posta adresi gerekli." };

    const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
    const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate, 7));

    if (overdueRecords.length === 0 && upcomingRecords.length === 0) {
      return { success: false, error: "Gönderilecek hatırlatıcı yok." };
    }

    const getPetName = (petId) => pets.find((p) => p.id === petId)?.name || "Bilinmeyen";

    let reminderList = "";

    if (overdueRecords.length > 0) {
      reminderList += "⚠️ GECİKMİŞ BAKIMLAR:\n";
      overdueRecords.forEach((r) => {
        const days = Math.abs(getDaysUntil(r.nextDate));
        reminderList += `• ${getPetName(r.petId)} — ${r.type} (${days} gün geçti)\n`;
      });
      reminderList += "\n";
    }

    if (upcomingRecords.length > 0) {
      reminderList += "⏰ YAKLAŞAN BAKIMLAR (7 gün içinde):\n";
      upcomingRecords.forEach((r) => {
        const days = getDaysUntil(r.nextDate);
        reminderList += `• ${getPetName(r.petId)} — ${r.type} (${days === 0 ? "Bugün!" : `${days} gün kaldı`} - ${formatDate(r.nextDate)})\n`;
      });
    }

    const subject = encodeURIComponent("🐾 PatiDefteri - Yaklaşan Bakım Hatırlatıcısı");
    const body = encodeURIComponent(
      `Merhaba ${userName || ""},\n\n` +
      `Evcil hayvanlarınız için hatırlatıcılarınız var:\n\n` +
      `${reminderList}\n` +
      `Sağlıklı günler dileriz! 🐾\n` +
      `PatiDefteri - https://pati-defteri.vercel.app`
    );

    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    return { success: true };
  };

  const hasReminders = () => {
    const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
    const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate, 7));
    return overdueRecords.length > 0 || upcomingRecords.length > 0;
  };

  return { sendReminderEmail, hasReminders };
}

export default useEmailReminder;