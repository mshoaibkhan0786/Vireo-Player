import { useState, useEffect, useRef } from 'react';
import { SplashHero } from '../components/layout/SplashHero';
import { cn } from '../lib/utils';
import { SEOHead } from '../components/layout/SEOHead';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { Controls } from '../components/player/Controls';
import { PlaylistSidebar } from '../components/player/PlaylistSidebar';
import { DropZone } from '../components/layout/DropZone';
import { usePlayer } from '../context/PlayerContext';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Home() {
    const {
        playlist, setPlaylist, currentVideoIndex,
        isPlaying, togglePlay,
        isPlaylistOpen
    } = usePlayer();
    const [view, setView] = useState('splash'); // splash | player

    useEffect(() => {
        if (playlist.length > 0) {
            setView('player');
        } else {
            setView('splash');
        }
    }, [playlist]);

    const handleFileSelect = (files) => {
        const newPlaylist = Array.from(files).map(file => ({
            name: file.name,
            src: URL.createObjectURL(file), // Still needed for immediate playback
            type: file.type,
            size: file.size,
            file: file // Store original file for IDB persistence
        })).filter(f => f.type.startsWith('video/'));

        if (newPlaylist.length > 0) {
            setPlaylist(prev => [...prev, ...newPlaylist]);
        }
    };

    const handleFileDrop = (files) => {
        handleFileSelect(files);
    };

    const goHome = () => {
        setPlaylist([]);
        setView('splash');
    };

    // Handlers for SplashHero inputs
    const onFileSelectWrapper = async (type) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = type === 'folder';
        input.webkitdirectory = type === 'folder';
        input.accept = 'video/*';
        input.onchange = (e) => handleFileSelect(e.target.files);
        input.click();
    };

    const currentVideo = playlist[currentVideoIndex];
    const isFullscreen = false;

    // Controls Visibility Logic (Mobile Friendly)
    const [isControlsVisible, setIsControlsVisible] = useState(false);
    const controlsTimeoutRef = useRef(null);

    const showControls = () => {
        setIsControlsVisible(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

        // Auto-hide after 3 seconds if playing
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setIsControlsVisible(false);
            }, 3000);
        }
    };

    // Keep controls visible while paused or hovering controls
    useEffect(() => {
        if (!isPlaying) {
            setIsControlsVisible(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        } else {
            // If playing started, trigger hide timer
            showControls();
        }
    }, [isPlaying]);

    return (
        <DropZone onFileDrop={handleFileDrop}>
            <SEOHead title={currentVideo ? currentVideo.name : null} />

            {view === 'splash' ? (
                <SplashHero
                    onFileSelect={onFileSelectWrapper}
                />
            ) : (
                <div
                    id="player-storage-root"
                    className="relative h-screen w-full bg-black flex flex-col md:flex-row overflow-hidden cursor-none hover:cursor-default"
                    onMouseMove={showControls}
                    onClick={showControls}
                    onTouchStart={showControls}
                >
                    {/* Player UI */}
                    <div className={cn(
                        "relative flex flex-col transition-all duration-300",
                        // Mobile: If playlist open, video shrinks to 40vh (landscape player style)
                        // Desktop: Always flex-1
                        isPlaylistOpen ? "h-[30vh] md:h-full md:flex-1" : "flex-1 h-full"
                    )}>
                        {/* Header with Home & Stats */}
                        <div className={cn(
                            "absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent pointer-events-none",
                            isControlsVisible ? "opacity-100" : "opacity-0"
                        )}>
                            <Button variant="ghost" onClick={goHome} className="text-white/80 hover:text-white flex items-center gap-2 pointer-events-auto" title="Back to Home">
                                <ChevronLeft className="w-6 h-6" />
                            </Button>

                            <div className="flex gap-2 items-center">
                                <h2 className="text-sm font-medium text-white/50 truncate max-w-md">
                                    {currentVideo ? currentVideo.name : 'Now Playing'}
                                </h2>
                            </div>
                        </div>

                        <div
                            id="video-container"
                            className={cn("relative flex-1 bg-black flex items-center justify-center overflow-hidden", isFullscreen ? "w-full h-full" : "")}
                        >
                            <VideoPlayer
                                src={currentVideo?.src}
                                className="w-full h-full"
                                onClick={togglePlay}
                            />
                            <Controls containerId="player-storage-root" isVisible={isControlsVisible} onInteraction={showControls} />
                        </div>
                    </div>

                    {/* Playlist Sidebar */}
                    <div className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden bg-zinc-950/95 md:bg-zinc-950/90 border-t md:border-t-0 md:border-l border-white/5",
                        // Mobile: Stacked below video
                        // Desktop: Side by side
                        "w-full md:h-full relative",
                        isPlaylistOpen
                            ? "flex-1 md:w-80 opacity-100 translate-y-0 md:translate-x-0"
                            : "h-0 md:h-full md:w-0 opacity-0 md:opacity-0 translate-y-full md:translate-y-0 md:translate-x-full"
                    )}>
                        <PlaylistSidebar />
                    </div>
                </div>
            )}
        </DropZone>
    );
}
