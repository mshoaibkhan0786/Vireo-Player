import { cn } from "../../lib/utils";

export function Button({ children, className, variant = "primary", ...props }) {
    const variants = {
        primary: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30",
        secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200",
        ghost: "bg-transparent hover:bg-white/10 text-gray-300 hover:text-white",
        icon: "p-2 rounded-full hover:bg-white/10 text-gray-200 transition-colors"
    };

    return (
        <button
            className={cn(
                "rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variant !== 'icon' && "px-6 py-3 text-lg",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
