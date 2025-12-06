import { Play } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export function SplashHero({ onFileSelect, onOpenStats }) {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-10 p-4">
            {/* Background Mesh */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 50%, #dc2626, transparent 70%)' }} />

            <GlassPanel className="flex flex-col items-center max-w-md w-full text-center p-10 transform hover:scale-105 transition-transform duration-500">
                <div className="mb-6 bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-full shadow-lg shadow-red-500/30">
                    <Play className="w-10 h-10 text-white fill-current" />
                </div>

                <h1 className="text-5xl font-bold text-white mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Vireo Player
                </h1>
                <p className="text-gray-400 mb-8 text-sm font-light tracking-wide">
                    CINEMATIC LOCAL PLAYER
                </p>

                <div className="flex flex-col gap-3 w-full">
                    <Button onClick={() => onFileSelect('folder')}>
                        Load Folder
                    </Button>

                    <div className="relative flex py-2 items-center w-full">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>

                    <Button variant="secondary" onClick={() => onFileSelect('file')}>
                        Open Single File
                    </Button>

                    <div className="h-4" /> {/* Spacer */}
                </div>
            </GlassPanel>
        </div>
    );
}
