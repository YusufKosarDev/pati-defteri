function Button({ children, onClick, variant = "primary", type = "button", className = "" }) {
  const base = "px-4 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer";

  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-600 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 text-gray-700",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;