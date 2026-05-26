import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isOverdue, isUpcoming } from "../utils/dateHelpers";

// E-posta gönderimi artık Convex action'ı üzerinden yapılır: kimlik doğrulama
// zorunlu, içerik ve alıcı sunucuda kullanıcının kendi verisinden kurulur.
function useEmailReminder(records) {
  const sendReminder = useAction(api.email.sendReminder);

  const sendReminderEmail = async () => {
    try {
      await sendReminder({});
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.message ?? "E-posta gönderilemedi." };
    }
  };

  const hasReminders = () => {
    const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
    const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate, 7));
    return overdueRecords.length > 0 || upcomingRecords.length > 0;
  };

  return { sendReminderEmail, hasReminders };
}

export default useEmailReminder;
