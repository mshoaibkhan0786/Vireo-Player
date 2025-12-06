import { usePlayer } from '../../context/PlayerContext';
import { cn } from '../../lib/utils';
import { Play, Pause } from 'lucide-react';
import { Button } from '../ui/Button';
import { useEffect } from 'react';

export function VideoPlayer({ src, className, onClick }) {
    const { videoRef, isPlaying, bindVideoEvents, incrementPlayCount } = usePlayer();

    useEffect(() => {
        if (videoRef.current) {
            const cleanup = bindVideoEvents(videoRef.current);
            return cleanup;
        }
    }, [bindVideoEvents, src]);

    // Track play count when source changes
    useEffect(() => {
        if (src) incrementPlayCount();
    }, [src, incrementPlayCount]);

    return (
        <div className="relative w-full h-full group/video" onClick={onClick}>
            <video
                ref={videoRef}
                src={src}
                className={cn("w-full h-full object-contain bg-black", className)}
                playsInline
            />

            {/* Center Play Button Overlay - Only visible when PAUSED */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                    <div className="p-6 rounded-full bg-red-600/90 border border-white/20 shadow-2xl scale-110">
                        <Play className="w-12 h-12 text-white fill-current ml-1" />
                    </div>
                </div>
            )}
        </div>
    );
}
