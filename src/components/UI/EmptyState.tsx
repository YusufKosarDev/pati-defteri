import { motion } from "framer-motion";
import type { ReactNode } from "react";

function NoPetsIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 mx-auto">
      <ellipse cx="100" cy="170" rx="70" ry="12" fill="#022c22" />
      <ellipse cx="100" cy="130" rx="38" ry="28" fill="#064e3b" />
      <circle cx="100" cy="90" r="28" fill="#064e3b" />
      <ellipse cx="76" cy="72" rx="10" ry="14" fill="#065f46" transform="rotate(-15 76 72)" />
      <ellipse cx="124" cy="72" rx="10" ry="14" fill="#065f46" transform="rotate(15 124 72)" />
      <circle cx="91" cy="88" r="4" fill="#a7f3d0" />
      <circle cx="109" cy="88" r="4" fill="#a7f3d0" />
      <ellipse cx="100" cy="98" rx="8" ry="5" fill="#065f46" />
      <path d="M96 100 Q100 105 104 100" stroke="#a7f3d0" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="93" cy="85" r="1.5" fill="white" />
      <circle cx="111" cy="85" r="1.5" fill="white" />
      <path d="M138 125 Q155 110 150 95" stroke="#065f46" strokeWidth="8" strokeLinecap="round" fill="none" />
      <ellipse cx="80" cy="155" rx="12" ry="8" fill="#065f46" />
      <ellipse cx="120" cy="155" rx="12" ry="8" fill="#065f46" />
      <circle cx="155" cy="55" r="18" fill="#022c22" stroke="#10b981" strokeWidth="2" />
      <text x="155" y="62" textAnchor="middle" fill="#10b981" fontSize="20" fontWeight="bold">?</text>
    </svg>
  );
}

function NoRecordsIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      <rect x="55" y="40" width="90" height="115" rx="10" fill="#022c22" stroke="#065f46" strokeWidth="2" />
      <path d="M115 40 L145 70 L115 70 Z" fill="#064e3b" />
      <path d="M115 40 L145 70" stroke="#065f46" strokeWidth="2" />
      <rect x="70" y="85" width="50" height="5" rx="2.5" fill="#064e3b" />
      <rect x="70" y="100" width="60" height="5" rx="2.5" fill="#064e3b" />
      <rect x="70" y="115" width="40" height="5" rx="2.5" fill="#064e3b" />
      <circle cx="145" cy="150" r="22" fill="#10b981" />
      <rect x="134" y="148" width="22" height="4" rx="2" fill="white" />
      <rect x="143" y="139" width="4" height="22" rx="2" fill="white" />
    </svg>
  );
}

function NoWeightIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      <rect x="75" y="155" width="50" height="10" rx="5" fill="#064e3b" />
      <rect x="97" y="100" width="6" height="55" rx="3" fill="#064e3b" />
      <circle cx="100" cy="95" r="35" fill="#022c22" stroke="#065f46" strokeWidth="2.5" />
      <circle cx="100" cy="95" r="25" fill="#111827" stroke="#064e3b" strokeWidth="2" />
      <line x1="100" y1="95" x2="118" y2="80" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="95" r="4" fill="#10b981" />
      <line x1="75" y1="95" x2="80" y2="95" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />
      <line x1="120" y1="95" x2="125" y2="95" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />
      <line x1="100" y1="70" x2="100" y2="75" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NoVetIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 mx-auto">
      <rect x="45" y="80" width="110" height="95" rx="8" fill="#022c22" stroke="#065f46" strokeWidth="2" />
      <path d="M35 85 L100 40 L165 85" fill="#064e3b" stroke="#065f46" strokeWidth="2" />
      <rect x="82" y="130" width="36" height="45" rx="4" fill="#065f46" />
      <rect x="58" y="100" width="30" height="25" rx="4" fill="#111827" stroke="#065f46" strokeWidth="1.5" />
      <rect x="112" y="100" width="30" height="25" rx="4" fill="#111827" stroke="#065f46" strokeWidth="1.5" />
      <circle cx="100" cy="62" r="14" fill="#10b981" />
      <rect x="93" y="58" width="14" height="8" rx="2" fill="white" />
      <rect x="96" y="55" width="8" height="14" rx="2" fill="white" />
    </svg>
  );
}

type EmptyStateProps = {
  type?: "pets" | "records" | "weight" | "vet";
  title?: string;
  desc?: string;
  action?: ReactNode;
};

function EmptyState({ type = "pets", title, desc, action }: EmptyStateProps) {
  const illustrations: Record<NonNullable<EmptyStateProps["type"]>, ReactNode> = {
    pets: <NoPetsIllustration />,
    records: <NoRecordsIllustration />,
    weight: <NoWeightIllustration />,
    vet: <NoVetIllustration />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-10"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {illustrations[type]}
      </motion.div>
      {title && <p className="text-lg font-semibold text-gray-200 mt-4">{title}</p>}
      {desc && <p className="text-sm text-gray-500 mt-1">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

export default EmptyState;
