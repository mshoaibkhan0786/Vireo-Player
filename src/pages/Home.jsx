import { useState, useEffect } from 'react';
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

    return (
        <DropZone onFileDrop={handleFileDrop}>
            <SEOHead title={currentVideo ? currentVideo.name : null} />

            {view === 'splash' ? (
                <SplashHero
                    onFileSelect={onFileSelectWrapper}
                />
            ) : (
                <div id="player-storage-root" className="relative h-screen w-full bg-black flex overflow-hidden">
                    {/* Player UI */}
                    <div className="flex-1 flex flex-col relative group/player">
                        {/* Header with Home & Stats */}
                        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-black/80 to-transparent">
                            <Button variant="ghost" onClick={goHome} className="text-white/80 hover:text-white flex items-center gap-2" title="Back to Home">
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
                            <Controls containerId="player-storage-root" />
                        </div>
                    </div>

                    {/* Playlist Sidebar */}
                    <div className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden bg-zinc-950/90 border-l border-white/5",
                        isPlaylistOpen ? "w-80 opacity-100" : "w-0 opacity-0"
                    )}>
                        <PlaylistSidebar />
                    </div>
                </div>
            )}
        </DropZone>
    );
}
