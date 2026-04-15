import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import { formatDate } from "../../utils/dateHelpers";
import WeightChart from "./WeightChart";
import WeightForm from "./WeightForm";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import EmptyState from "../UI/EmptyState";

function WeightSection({ petId }) {
  const { getWeightsByPet, deleteWeight } = usePet();
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);

  const weights = getWeightsByPet(petId);
  const sorted = [...weights].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted[0];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">⚖️ {t("weightTitle")}</h3>
          {latest && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t("weightLast")} <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{latest.weight} kg</span> — {formatDate(latest.date)}
            </p>
          )}
        </div>
        <Button onClick={() => setAddOpen(true)}>{t("addWeight")}</Button>
      </div>

      {weights.length === 0 ? (
        <EmptyState type="weight" title={t("noWeight")} />
      ) : (
        <>
          <WeightChart weights={weights} />
          <div className="mt-4 flex flex-col gap-2">
            {sorted.map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                <span className="text-gray-500 dark:text-gray-400">{formatDate(w.date)}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{w.weight} kg</span>
                {w.notes && <span className="text-gray-400 dark:text-gray-500 text-xs">{w.notes}</span>}
                <button onClick={() => deleteWeight(w.id)} className="text-red-400 hover:text-red-600 text-xs cursor-pointer">{t("weightDelete")}</button>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title={t("addWeightTitle")}>
        <WeightForm petId={petId} onClose={() => setAddOpen(false)} />
      </Modal>
    </div>
  );
}

export default WeightSection;