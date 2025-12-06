import { GlassPanel } from '../components/ui/GlassPanel';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Clock, PlayCircle, Users, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/layout/SEOHead';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

export function Dashboard() {
    const { stats } = usePlayer();
    const [timeRange, setTimeRange] = useState('7d'); // '24h', '7d', 'calendar'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const dateInputRef = useRef(null);

    // Helper to format large seconds into H:M
    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const handleCalendarClick = () => {
        setTimeRange('calendar');
        if (dateInputRef.current) {
            dateInputRef.current.showPicker();
        }
    };

    const getGraphData = () => {
        const today = new Date();
        let labels = [];
        let dataPoints = [];

        if (timeRange === '7d') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

                const val = stats.history?.[dateStr]?.totalWatchTime || 0;
                dataPoints.push(Math.round(val / 60)); // Minutes
            }
        } else if (timeRange === '24h') {
            // 24 Hour Breakdown (Hour Wise)
            const dateStr = today.toISOString().split('T')[0];
            for (let i = 0; i < 24; i++) {
                // Label: 12 AM, 1 AM...
                const hourLabel = i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`;
                // Display fewer labels for space if on mobile? No, grid handles it.
                // Show e.g. 0, 4, 8, 12, 16, 20
                labels.push(hourLabel);

                const key = `${dateStr}-${i}`;
                const val = stats.hourly?.[key]?.totalWatchTime || 0; // assuming hourly stats exist now
                dataPoints.push(Math.round(val / 60));
            }
        } else if (timeRange === 'calendar') {
            // Show hourly breakdown for the SELECTED date
            for (let i = 0; i < 24; i++) {
                const hourLabel = i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`;
                labels.push(hourLabel);

                const key = `${selectedDate}-${i}`;
                const val = stats.hourly?.[key]?.totalWatchTime || 0;
                dataPoints.push(Math.round(val / 60));
            }
        }

        return { labels, dataPoints };
    };

    const { labels, dataPoints } = getGraphData();
    const maxVal = Math.max(...dataPoints, 10);

    // Force Title Update (Nuclear Option)
    useEffect(() => {
        document.title = "Dashboard";
        return () => {
            document.title = "Vireo Player";
        };
    }, []);

    const getAggregatedStats = () => {
        let totalWatchTime = 0;
        let videosPlayed = 0;
        let sessions = 0;
        let sessionWatchTime = 0; // Live session only relevant for today

        if (timeRange === '7d') {
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dayStats = stats.history?.[dateStr];

                if (dayStats) {
                    totalWatchTime += (dayStats.totalWatchTime || 0);
                    videosPlayed += (dayStats.videosPlayed || 0);
                    sessions += (dayStats.sessions || 0);
                }
            }
            // Add current live session if within 7 days (essentially always)
            sessionWatchTime = stats.today?.sessionWatchTime || 0;
        } else if (timeRange === '24h') {
            // "24h" here implies Today.
            const dateStr = new Date().toISOString().split('T')[0];
            const dayStats = stats.history?.[dateStr];
            if (dayStats) {
                totalWatchTime = dayStats.totalWatchTime || 0;
                videosPlayed = dayStats.videosPlayed || 0;
                sessions = dayStats.sessions || 0;
            }
            // Add live session
            // Note: stats.history is usually updated on interval, but stats.today tracks live sessionWatchTime separate from history for UI
            // However, PlayerContext updates history every second too.
            // Let's use history for reliability, + live session specific buffer if needed.
            // Actually, PlayerContext updates history directly.
            sessionWatchTime = stats.today?.sessionWatchTime || 0;
        } else if (timeRange === 'calendar') {
            const dayStats = stats.history?.[selectedDate];
            if (dayStats) {
                totalWatchTime = dayStats.totalWatchTime || 0;
                videosPlayed = dayStats.videosPlayed || 0;
                sessions = dayStats.sessions || 0;
            }
            // Only show live session time if selected date is TODAY
            if (selectedDate === new Date().toISOString().split('T')[0]) {
                sessionWatchTime = stats.today?.sessionWatchTime || 0;
            } else {
                sessionWatchTime = 0;
            }
        }

        return { totalWatchTime, videosPlayed, sessions, sessionWatchTime };
    };

    const currentStats = getAggregatedStats();

    // Dynamic Labels
    const rangeLabel = timeRange === '7d' ? "7-Day" : timeRange === 'calendar' ? "Daily" : "Today's";

    return (
        <div className="h-screen bg-black text-white p-4 md:p-8 relative overflow-y-auto overflow-x-hidden font-sans pb-32 md:pb-40">

            {/* Background Mesh */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 10%, #dc2626, transparent 60%)' }} />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600 rounded-xl shadow-lg shadow-red-600/20">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
                            <p className="text-sm md:text-base text-gray-400">Overview of user activity.</p>
                        </div>
                    </div>

                    <Link to="/">
                        <Button variant="outline" className="border-white/10 hover:bg-white/10 gap-2 w-full md:w-auto justify-center">
                            <ChevronLeft className="w-4 h-4" /> Back to Player
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Total Watch Time */}
                    <GlassPanel className="p-8 flex flex-col gap-4 group hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                <Clock className="w-6 h-6" />
                            </div>
                            {currentStats.sessionWatchTime > 0 && (
                                <span className="text-xs font-mono text-green-400 flex items-center bg-green-900/20 px-2 py-1 rounded-full">
                                    +{(currentStats.sessionWatchTime / 60).toFixed(0)}m Live
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-gray-400 font-medium mb-1">{rangeLabel} Watch Time</h3>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                {formatDuration(currentStats.totalWatchTime)}
                            </p>
                        </div>
                    </GlassPanel>

                    {/* Videos Played */}
                    <GlassPanel className="p-8 flex flex-col gap-4 group hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                                <PlayCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-gray-400 font-medium mb-1">{rangeLabel} Plays</h3>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                {currentStats.videosPlayed}
                            </p>
                        </div>
                    </GlassPanel>

                    {/* Sessions */}
                    <GlassPanel className="p-8 flex flex-col gap-4 group hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-mono text-gray-500 flex items-center bg-white/5 px-2 py-1 rounded-full">
                                Local
                            </span>
                        </div>
                        <div>
                            <h3 className="text-gray-400 font-medium mb-1">{rangeLabel} Sessions</h3>
                            <p className="text-3xl font-bold text-white tracking-tight">
                                {currentStats.sessions}
                            </p>
                        </div>
                    </GlassPanel>

                    {/* Average Watch Time */}
                    <GlassPanel className="p-8 flex flex-col gap-4 group hover:bg-white/5 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                        </div>
                        {/* Calculation Logic */}
                        {(() => {
                            const avgSeconds = currentStats.videosPlayed > 0
                                ? currentStats.totalWatchTime / currentStats.videosPlayed
                                : 0;

                            return (
                                <div>
                                    <h3 className="text-gray-400 font-medium mb-1">Avg. Watch Time</h3>
                                    <p className="text-3xl font-bold text-white tracking-tight">
                                        {formatDuration(avgSeconds)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Per video play</p>
                                </div>
                            );
                        })()}
                    </GlassPanel>
                </div>

                {/* Big Chart Section */}
                <GlassPanel className="p-4 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-white">Engagement History</h3>
                            <p className="text-sm text-gray-400">
                                {timeRange === '7d' && "Watch time over the last 7 days."}
                                {timeRange === '24h' && "Hourly breakdown for Today."}
                                {timeRange === 'calendar' && `Hourly breakdown for ${selectedDate}.`}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 bg-black/40 p-1 rounded-lg">
                            <button
                                onClick={() => setTimeRange('24h')}
                                className={cn("px-3 py-1.5 text-xs rounded-md transition-all", timeRange === '24h' ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white")}
                            >
                                Last 24h
                            </button>
                            <button
                                onClick={() => setTimeRange('7d')}
                                className={cn("px-3 py-1.5 text-xs rounded-md transition-all", timeRange === '7d' ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white")}
                            >
                                Last 7 Days
                            </button>

                            <div className="relative flex items-center">
                                <button
                                    onClick={handleCalendarClick}
                                    className={cn("px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-2", timeRange === 'calendar' ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-white")}
                                >
                                    <CalendarIcon className="w-3 h-3" />
                                    {timeRange === 'calendar' ? selectedDate : 'Date'}
                                </button>
                                {/* Date Input - Hidden but accessible via showPicker */}
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setSelectedDate(e.target.value);
                                            setTimeRange('calendar');
                                        }
                                    }}
                                    className="sr-only"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-48 flex items-end gap-1 px-2 border-b border-white/5 pb-2 w-full">
                        {dataPoints.map((val, i) => {
                            const heightPercent = maxVal > 0 ? (val / maxVal) * 100 : 0;
                            // For 24h view, show labels every 4 hours to avoid clutter
                            const showLabel = timeRange !== '7d' ? i % 4 === 0 : true;

                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group/bar gap-2 min-w-0" title={`${labels[i]}: ${val} mins`}>
                                    <div
                                        className="w-full bg-gradient-to-t from-red-600/20 via-red-600/40 to-red-500/80 rounded-t-sm hover:from-white/20 hover:to-white/40 transition-all duration-300 relative"
                                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {labels[i]}: {val}m
                                        </div>
                                    </div>
                                    <span className={cn("text-[10px] text-center text-gray-500 font-mono truncate w-full block", !showLabel && "opacity-0 md:opacity-100 md:text-[8px]")}>
                                        {/* Show all labels on desktop, hide some on mobile if needed. Actually simpler to just hide some */}
                                        {showLabel ? labels[i] : ''}
                                    </span>
                                </div>
                            );
                        })}
                        {dataPoints.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                No data for this period
                            </div>
                        )}
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
}
