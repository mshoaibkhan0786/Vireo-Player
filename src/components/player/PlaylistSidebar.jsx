import { FileVideo, X } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { GlassPanel } from '../ui/GlassPanel';
import { cn } from '../../lib/utils';

export function PlaylistSidebar() {
    const { playlist, currentVideoIndex, setCurrentVideoIndex, togglePlaylist } = usePlayer();

    if (!playlist || playlist.length === 0) return null;

    return (
        <div className="w-80 h-[80vh] overflow-y-auto hidden md:flex flex-col gap-2 p-2">
            <GlassPanel className="h-full overflow-y-auto p-4 custom-scrollbar">
                <div className="flex items-center justify-between mb-4 sticky top-0 z-10 pb-2 border-b border-white/10 bg-inherit/95 backdrop-blur-xl">
                    <h3 className="text-lg font-semibold text-white">Playlist</h3>
                    <button
                        onClick={togglePlaylist}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        title="Close Playlist"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {playlist.map((video, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentVideoIndex(index)}
                            className={cn(
                                "w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group",
                                currentVideoIndex === index
                                    ? "bg-red-600/20 border border-red-500/50 text-white"
                                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                            )}
                        >
                            <div className={cn("p-2 rounded-full", currentVideoIndex === index ? "bg-red-600" : "bg-white/10 group-hover:bg-white/20")}>
                                <FileVideo className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-medium">{video.name}</p>
                                <p className="text-xs opacity-60 truncate">{(video.size / (1024 * 1024)).toFixed(1)} MB</p>
                            </div>
                        </button>
                    ))}
                </div>
            </GlassPanel>
        </div>
    );
}
