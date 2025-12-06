import { cn } from "../../lib/utils";

export function Slider({ className, style, max = 100, value = 0, ...props }) {
    const percent = ((value / max) * 100).toFixed(2);

    return (
        <input
            type="range"
            max={max}
            value={value}
            className={cn(
                "w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all",
                // Remove accent class as we use thumb styling. We keep accent for fallback but style logic overrides.
                // We add global css for thumb in index.css usually, but inline style works for track.
                className
            )}
            style={{
                background: `linear-gradient(to right, #dc2626 ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%)`,
                ...style
            }}
            {...props}
        />
    );
}
