import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { savePlaylistToDB, getPlaylistFromDB } from '../lib/db';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [playlist, setPlaylist] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [subtitleTracks, setSubtitleTracks] = useState([]);
    const [audioTracks, setAudioTracks] = useState([]);

    const [isPlaylistOpen, setIsPlaylistOpen] = useState(true);

    // Persistence: Save Playlist to IDB
    useEffect(() => {
        if (playlist.length > 0) {
            savePlaylistToDB(playlist).catch(console.error);
        }
    }, [playlist]);

    // Persistence: Save Playback State (Index & Time)
    useEffect(() => {
        if (playlist.length > 0) {
            localStorage.setItem('vireo_playback_state', JSON.stringify({
                index: currentVideoIndex,
                time: currentTime
            }));
        }
    }, [currentVideoIndex, currentTime, playlist.length]);

    // Recovery: Load Playlist & State on Mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const doc = await getPlaylistFromDB();
                if (doc && doc.length > 0) {
                    // Regenerate Blob URLs
                    const restoredPlaylist = doc.map(item => ({
                        ...item,
                        src: URL.createObjectURL(item.file)
                    }));
                    setPlaylist(restoredPlaylist);

                    // Restore Index & Time
                    const savedState = localStorage.getItem('vireo_playback_state');
                    if (savedState) {
                        const { index, time } = JSON.parse(savedState);
                        if (index < restoredPlaylist.length) {
                            setCurrentVideoIndex(index);
                            setTimeout(() => { // slight delay to ensure ref is attached
                                if (videoRef.current) videoRef.current.currentTime = time;
                            }, 500);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to restore session", e);
            }
        };
        restoreSession();
    }, []);

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    // Statistics State: { history: { 'YYYY-MM-DD': { watchTime, plays, sessions } } }
    const [stats, setStats] = useState({
        history: {},
        today: { totalWatchTime: 0, videosPlayed: 0, sessions: 0, sessionWatchTime: 0 }
    });

    // Load Stats - SAFE VERSION (v7)
    useEffect(() => {
        try {
            const savedStats = localStorage.getItem('vireo_stats_v7');
            const todayDate = getTodayDate();
            let history = {};

            if (savedStats) {
                try {
                    history = JSON.parse(savedStats);
                } catch (e) {
                    console.error("JSON Parse Error", e);
                    history = {};
                }
            }

            // Ensure today exists
            if (!history[todayDate]) {
                history[todayDate] = { totalWatchTime: 0, videosPlayed: 0, sessions: 0 };
            }

            // Check for active session
            const hasSession = sessionStorage.getItem('vireo_session_active');
            if (!hasSession) {
                history[todayDate].sessions += 1;
                sessionStorage.setItem('vireo_session_active', 'true');
            }

            setStats({
                history,
                today: { ...history[todayDate], sessionWatchTime: 0 }
            });
            localStorage.setItem('vireo_stats_v7', JSON.stringify(history));

        } catch (err) {
            console.error("Stats Error:", err);
            // Fallback
            setStats({
                history: {},
                today: { totalWatchTime: 0, videosPlayed: 0, sessions: 0, sessionWatchTime: 0 }
            });
        }
    }, []);

    // Track Watch Time
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setStats(prev => {
                    const todayDate = getTodayDate();
                    const currentHistory = { ...prev.history };

                    if (!currentHistory[todayDate]) {
                        currentHistory[todayDate] = { totalWatchTime: 0, videosPlayed: 0, sessions: 1 };
                    }

                    currentHistory[todayDate].totalWatchTime += 1;
                    localStorage.setItem('vireo_stats_v7', JSON.stringify(currentHistory));

                    return {
                        history: currentHistory,
                        today: {
                            ...currentHistory[todayDate],
                            sessionWatchTime: prev.today.sessionWatchTime + 1
                        }
                    };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const incrementPlayCount = useCallback(() => {
        setStats(prev => {
            const todayDate = getTodayDate();
            const currentHistory = { ...prev.history };

            if (!currentHistory[todayDate]) {
                currentHistory[todayDate] = { totalWatchTime: 0, videosPlayed: 0, sessions: 1 };
            }

            currentHistory[todayDate].videosPlayed += 1;
            localStorage.setItem('vireo_stats_v7', JSON.stringify(currentHistory));

            return {
                history: currentHistory,
                today: {
                    ...currentHistory[todayDate],
                    sessionWatchTime: prev.today.sessionWatchTime
                }
            };
        });
    }, []);

    const resetStats = () => {
        const todayDate = getTodayDate();
        const emptyStats = { totalWatchTime: 0, videosPlayed: 0, sessions: 1 };
        const newHistory = { [todayDate]: emptyStats };
        setStats({
            history: newHistory,
            today: { ...emptyStats, sessionWatchTime: 0 }
        });
        localStorage.setItem('vireo_stats_v7', JSON.stringify(newHistory));
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play().catch(e => console.error("Play failed", e));
            } else {
                videoRef.current.pause();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(videoRef.current.muted);
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleTracksChange = () => {
        if (!videoRef.current) return;

        // Text Tracks (Subtitles)
        const subs = Array.from(videoRef.current.textTracks).map((track, index) => ({
            index,
            label: track.label || `Track ${index + 1}`,
            language: track.language,
            kind: track.kind,
            mode: track.mode
        }));
        setSubtitleTracks(subs);

        // Audio Tracks
        if (videoRef.current.audioTracks) {
            const audios = Array.from(videoRef.current.audioTracks).map((track, index) => ({
                index,
                label: track.label || `Audio ${index + 1}`,
                language: track.language,
                enabled: track.enabled
            }));
            setAudioTracks(audios);
        }
    };

    // Exposed function to bind events once the video element is ready
    const bindVideoEvents = (videoElement) => {
        if (!videoElement) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onWaiting = () => setIsWaiting(true);
        const onPlaying = () => setIsWaiting(false);

        videoElement.addEventListener('play', onPlay);
        videoElement.addEventListener('pause', onPause);
        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('waiting', onWaiting);
        videoElement.addEventListener('playing', onPlaying);

        // Track events
        videoElement.textTracks.addEventListener('change', handleTracksChange);
        videoElement.addEventListener('loadeddata', handleTracksChange);

        return () => {
            videoElement.removeEventListener('play', onPlay);
            videoElement.removeEventListener('pause', onPause);
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            videoElement.removeEventListener('waiting', onWaiting);
            videoElement.removeEventListener('playing', onPlaying);
            videoElement.removeEventListener('loadeddata', handleTracksChange);
            if (videoElement.textTracks) videoElement.textTracks.removeEventListener('change', handleTracksChange);
        };
    };

    // Fullscreen Logic
    const toggleFullscreen = () => {
        const container = document.getElementById('player-storage-root');
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen()
                .then(() => setIsPlaylistOpen(false)) // Auto-close playlist
                .catch(err => console.error("Fullscreen error:", err));
        } else {
            document.exitFullscreen();
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'arrowright':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.currentTime += 5;
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.currentTime -= 5;
                    break;
                case 'arrowup':
                    e.preventDefault();
                    setVolume(Math.min(1, volume + 0.1));
                    if (videoRef.current) {
                        videoRef.current.volume = Math.min(1, volume + 0.1);
                        videoRef.current.muted = false;
                        setIsMuted(false);
                    }
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    setVolume(Math.max(0, volume - 0.1));
                    if (videoRef.current) {
                        videoRef.current.volume = Math.max(0, volume - 0.1);
                        videoRef.current.muted = false;
                        setIsMuted(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [volume, isMuted, togglePlay]);

    return (
        <PlayerContext.Provider
            value={{
                videoRef,
                bindVideoEvents,
                isPlaying,
                togglePlay,
                volume,
                setVolume: (vol) => { setVolume(vol); if (videoRef.current) { videoRef.current.volume = vol; videoRef.current.muted = false; setIsMuted(false); } },
                isMuted,
                toggleMute,
                playbackSpeed,
                setPlaybackSpeed: (speed) => { setPlaybackSpeed(speed); if (videoRef.current) videoRef.current.playbackRate = speed; },
                playlist,
                setPlaylist,
                currentVideoIndex,
                setCurrentVideoIndex,
                currentTime,
                duration,
                isWaiting,
                seek: (time) => { if (videoRef.current) videoRef.current.currentTime = time; },
                subtitleTracks,
                audioTracks,
                setSubtitleMode: (index, mode) => {
                    if (videoRef.current && videoRef.current.textTracks[index]) {
                        Array.from(videoRef.current.textTracks).forEach(t => t.mode = 'disabled');
                        videoRef.current.textTracks[index].mode = mode;
                        handleTracksChange();
                    }
                },
                toggleAudioTrack: (index) => {
                    if (videoRef.current && videoRef.current.audioTracks && videoRef.current.audioTracks[index]) {
                        Array.from(videoRef.current.audioTracks).forEach(t => t.enabled = false);
                        videoRef.current.audioTracks[index].enabled = true;
                        handleTracksChange();
                    }
                },
                isPlaylistOpen,
                setIsPlaylistOpen,
                togglePlaylist: () => setIsPlaylistOpen(prev => !prev),
                stats,
                incrementPlayCount,
                resetStats,
                toggleFullscreen
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => useContext(PlayerContext);
