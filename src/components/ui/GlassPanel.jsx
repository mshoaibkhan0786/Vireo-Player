import { cn } from "../../lib/utils";

export function GlassPanel({ children, className }) {
    return (
        <div
            className={cn(
                "glass-panel p-6 rounded-2xl",
                className
            )}
        >
            {children}
        </div>
    );
}
