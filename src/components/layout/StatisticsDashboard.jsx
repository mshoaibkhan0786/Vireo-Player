import { GlassPanel } from '../ui/GlassPanel';
import { Button } from '../ui/Button';
import { X, Activity, Clock, PlayCircle, Users, TrendingUp } from 'lucide-react';
import { formatTime } from '../../lib/utils'; // Assuming formatTime manages seconds

export function StatisticsDashboard({ onClose, stats }) {
    // Helper to format large seconds into H:M
    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <GlassPanel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </Button>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Activity className="text-red-500" />
                        Admin Dashboard
                    </h2>
                    <p className="text-gray-400 mt-2">Live statistics and user engagement metrics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Watch Time */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-400 font-medium">Watch Time</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">
                            {formatDuration(stats.totalWatchTime)}
                        </p>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> +{(stats.sessionWatchTime / 60).toFixed(1)}m this session
                        </p>
                    </div>

                    {/* Videos Played */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
                                <PlayCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-400 font-medium">Videos Played</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">
                            {stats.videosPlayed}
                        </p>
                        <p className="text-xs text-gray-500">
                            Total historical plays
                        </p>
                    </div>

                    {/* Visitors / Sessions */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-gray-400 font-medium">Total Sessions</h3>
                        </div>
                        <p className="text-4xl font-bold text-white mb-1">
                            {stats.sessions}
                        </p>
                        <p className="text-xs text-gray-500">
                            Unique visits detected
                        </p>
                    </div>
                </div>

                {/* Mock Graph Area */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-white font-semibold mb-6">Activity Overview</h3>
                    <div className="h-48 flex items-end gap-2">
                        {[40, 65, 34, 89, 56, 72, 95, 45, 67, 88, 55, 76].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-red-600/20 to-red-600/60 rounded-t-sm hover:from-red-500/40 hover:to-red-500/80 transition-all duration-300"
                                style={{ height: `${h}%` }}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                        <span>Jan</span><span>Dec</span>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
}
