import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isOverdue, isUpcoming } from "../utils/dateHelpers";
import type { PetRecord, ActionResult } from "../types";

// E-posta gönderimi artık Convex action'ı üzerinden yapılır: kimlik doğrulama
// zorunlu, içerik ve alıcı sunucuda kullanıcının kendi verisinden kurulur.
function useEmailReminder(records: PetRecord[]) {
  const sendReminder = useAction(api.email.sendReminder);

  const sendReminderEmail = async (): Promise<ActionResult> => {
    try {
      await sendReminder({});
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "E-posta gönderilemedi.";
      return { success: false, error: message };
    }
  };

  const hasReminders = (): boolean => {
    const overdueRecords = records.filter((r) => r.nextDate && isOverdue(r.nextDate));
    const upcomingRecords = records.filter((r) => r.nextDate && isUpcoming(r.nextDate, 7));
    return overdueRecords.length > 0 || upcomingRecords.length > 0;
  };

  return { sendReminderEmail, hasReminders };
}

export default useEmailReminder;
