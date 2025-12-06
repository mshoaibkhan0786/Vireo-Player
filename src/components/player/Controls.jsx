import { Play, Pause, Volume2, VolumeX, Maximize, Settings, ChevronLeft, ChevronRight, Minimize, List, MonitorPlay, Zap } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { formatTime, cn } from '../../lib/utils';
import { useState } from 'react';

export function Controls({ containerId, isVisible, onInteraction }) {
    const {
        isPlaying, togglePlay, volume, setVolume, currentTime, duration, seek, toggleMute, isMuted,
        subtitleTracks, setSubtitleMode, audioTracks, toggleAudioTrack,
        isPlaylistOpen, togglePlaylist, setIsPlaylistOpen,
        playbackSpeed, setPlaybackSpeed, videoRef, toggleFullscreen
    } = usePlayer();
    const [showVolume, setShowVolume] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Sync local fullscreen state with document (in case F key is used)
    useState(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const togglePiP = async () => {
        if (!videoRef.current) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error("PiP failed:", error);
        }
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        onInteraction?.();
        togglePlay();
    };

    return (
        <div
            className={cn(
                "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-24 transition-opacity duration-300",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={(e) => {
                e.stopPropagation();
                onInteraction?.();
            }}
        >
            <div className="flex flex-col gap-2 max-w-4xl mx-auto w-full relative">
                {/* Settings Popover */}
                {showSettings && (
                    <div className="absolute bottom-16 right-0 w-64 glass-panel p-4 flex flex-col gap-4 text-sm z-20">
                        {/* Speed Control */}
                        <div>
                            <h4 className="text-gray-400 mb-2 font-semibold flex items-center gap-2"><Zap className="w-3 h-3" /> Speed</h4>
                            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                                {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => setPlaybackSpeed(speed)}
                                        className={cn("flex-1 py-1 rounded text-xs hover:bg-white/10 transition-colors", playbackSpeed === speed && "bg-red-600 text-white font-bold")}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-white/10 my-2" />

                        {/* Subtitles */}
                        <div>
                            <h4 className="text-gray-400 mb-2 font-semibold">Subtitles</h4>
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                                <button
                                    onClick={() => {
                                        subtitleTracks.forEach(t => setSubtitleMode(t.index, 'disabled'));
                                    }}
                                    className="text-left px-2 py-1 hover:bg-white/10 rounded"
                                >
                                    Off
                                </button>
                                {subtitleTracks.map(track => (
                                    <button
                                        key={track.index}
                                        onClick={() => setSubtitleMode(track.index, 'showing')}
                                        className={cn("text-left px-2 py-1 hover:bg-white/10 rounded", track.mode === 'showing' && "text-red-500 font-medium")}
                                    >
                                        {track.label} ({track.language})
                                    </button>
                                ))}
                                {subtitleTracks.length === 0 && <span className="text-gray-600 px-2">No subtitles</span>}
                            </div>
                        </div>

                        {/* Audio Tracks */}
                        <div className="mt-2">
                            <h4 className="text-gray-400 mb-2 font-semibold">Audio</h4>
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                                {audioTracks.map(track => (
                                    <button
                                        key={track.index}
                                        onClick={() => toggleAudioTrack(track.index)}
                                        className={cn("text-left px-2 py-1 hover:bg-white/10 rounded", track.enabled && "text-red-500 font-medium")}
                                    >
                                        {track.label} ({track.language})
                                    </button>
                                ))}
                                {audioTracks.length === 0 && <span className="text-gray-600 px-2">Default Audio</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <Slider
                        min={0} max={duration || 100}
                        value={currentTime}
                        onChange={(e) => seek(Number(e.target.value))}
                        className="h-1.5 accent-red-600 flex-1"
                    />
                    <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {/* Prev */}
                        <Button variant="ghost" className="p-2 rounded-full">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        {/* Play/Pause */}
                        <Button variant="ghost" onClick={handlePlayPause} className="p-2 hover:bg-white/20 rounded-full text-white">
                            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                        </Button>

                        {/* Next */}
                        <Button variant="ghost" className="p-2 rounded-full">
                            <ChevronRight className="w-5 h-5" />
                        </Button>

                        {/* Volume */}
                        <div
                            className="flex items-center gap-2 group/vol relative ml-2"
                            onMouseEnter={() => setShowVolume(true)}
                            onMouseLeave={() => setShowVolume(false)}
                        >
                            <Button variant="ghost" onClick={toggleMute} className="p-2 rounded-full">
                                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            </Button>

                            <div className={cn("overflow-hidden transition-all duration-300 flex items-center", showVolume ? "w-24 opacity-100" : "w-0 opacity-0")}>
                                <Slider
                                    min={0} max={1} step={0.05}
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="w-20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Playlist Toggle */}
                        <Button
                            variant="ghost"
                            className={cn("p-2 rounded-full", isPlaylistOpen && "text-red-500 bg-white/10")}
                            onClick={togglePlaylist}
                            title="Toggle Playlist"
                        >
                            <List className="w-5 h-5" />
                        </Button>

                        {/* PiP */}
                        <Button
                            variant="ghost"
                            className="p-2 rounded-full"
                            onClick={togglePiP}
                            title="Picture-in-Picture"
                        >
                            <MonitorPlay className="w-5 h-5" />
                        </Button>

                        {/* Settings */}
                        <Button variant="ghost" className="p-2 rounded-full relative" onClick={() => setShowSettings(!showSettings)}>
                            <Settings className={cn("w-5 h-5 transition-transform", showSettings && "rotate-90")} />
                        </Button>

                        {/* Fullscreen */}
                        <Button variant="ghost" className="p-2 rounded-full" onClick={toggleFullscreen}>
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
