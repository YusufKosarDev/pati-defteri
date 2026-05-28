import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
};

function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white",
    secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-950",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
