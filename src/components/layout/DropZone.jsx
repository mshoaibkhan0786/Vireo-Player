import { Upload } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

export function DropZone({ onFilesDropped, children }) {
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        let dragCounter = 0;

        const handleDragEnter = (e) => {
            e.preventDefault();
            dragCounter++;
            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                setIsDragging(true);
            }
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter === 0) {
                setIsDragging(false);
            }
        };

        const handleDragOver = (e) => {
            e.preventDefault();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            setIsDragging(false);
            dragCounter = 0;

            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
            if (files.length > 0) {
                onFilesDropped(files);
            }
        };

        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
        };
    }, [onFilesDropped]);

    return (
        <>
            <div className={cn(
                "fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none",
                isDragging ? "opacity-100" : "opacity-0"
            )} id="drop-overlay">
                <GlassPanel className="p-12 border-2 border-dashed border-red-500 flex flex-col items-center scale-100">
                    <Upload className="w-24 h-24 text-red-500 mb-6" />
                    <h2 className="text-3xl font-bold text-white">Drop to Play</h2>
                </GlassPanel>
            </div>
            {children}
        </>
    );
}
