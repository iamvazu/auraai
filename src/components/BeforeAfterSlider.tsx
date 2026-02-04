
import React, { useState, useEffect, useRef } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { AnalysisResult } from '../types';

const BeforeAfterSlider = ({ beforeImage, afterImage, analysis }: { beforeImage: string, afterImage: string | null, analysis: AnalysisResult | null }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = () => setIsResizing(true);
    const handleMouseUp = () => setIsResizing(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isResizing || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden select-none cursor-ew-resize group"
            onMouseMove={handleMouseMove}
        >
            {/* AFTER Image (Background) */}
            <div className="absolute inset-0 w-full h-full bg-stone-200">
                {afterImage ? (
                    <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                        Rendering...
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-orange-600/90 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest backdrop-blur shadow-xl z-20">
                    Reimagined (Oasis)
                </div>
            </div>

            {/* BEFORE Image (Foreground - Clipped) */}
            <div
                className="absolute inset-0 w-full h-full bg-white border-r-4 border-white shadow-2xl overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
            >
                <img src={beforeImage} alt="Before" className="absolute top-0 left-0 max-w-none w-[100vw] xl:w-[calc(100vw-400px)] h-full object-cover sm:object-contain object-left bg-stone-50" style={{ width: containerRef.current?.offsetWidth }} />

                {/* Sketch Overlays (Visionary Agent Output) */}
                {analysis?.objects.map((obj, i) => (
                    <div key={`obj-${i}`}
                        className="absolute border border-orange-500/50 bg-orange-500/10 flex items-center justify-center"
                        style={{
                            top: `${obj.bbox[0] / 10}%`, left: `${obj.bbox[1] / 10}%`,
                            width: `${(obj.bbox[3] - obj.bbox[1]) / 10}%`, height: `${(obj.bbox[2] - obj.bbox[0]) / 10}%`
                        }}
                    >
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-glow"></div>
                    </div>
                ))}

                <div className="absolute top-4 left-4 bg-stone-900/80 text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest backdrop-blur shadow-xl">
                    Original Sketch
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-30 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center hover:bg-orange-500 transition-colors"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
            >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-stone-100 text-stone-600">
                    <MoveHorizontal size={20} />
                </div>
            </div>
        </div>
    );
};

export default BeforeAfterSlider;
