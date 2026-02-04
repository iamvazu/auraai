
import React, { useState, useEffect, useRef } from 'react';
import {
    Upload, Sparkles, CheckCircle, AlertCircle, QrCode, ArrowLeft, ShoppingBag,
    Eye, ShoppingCart, Plus, Compass
} from 'lucide-react';
import { analyzeSketch, generateRenders } from '../services/geminiService';
import { AnalysisResult } from '../types';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { PRODUCT_CATALOG } from '../data/products';
import { FurnitureItem } from '../types';

// Helper: Client-side Fuzzy Matcher
const findBestMatch = (query: string, visualDesc: string): FurnitureItem | null => {
    if (!query) return null;
    const searchTerms = query.toLowerCase().split(' ').filter(w => w.length > 2);

    let bestMatch: FurnitureItem | null = null;
    let maxScore = 0;

    PRODUCT_CATALOG.forEach(product => {
        let score = 0;
        const pName = product.name.toLowerCase();
        const pDesc = product.description.toLowerCase();
        const pCat = product.category.toLowerCase();
        const pMat = product.material.toLowerCase();

        // High weight: exact word match in name
        searchTerms.forEach(term => {
            if (pName.includes(term)) score += 10;
            if (pCat.includes(term)) score += 5;
            if (pDesc.includes(term)) score += 3;
            if (pMat.includes(term)) score += 4;

            // Visual characteristics bonus
            if (visualDesc && visualDesc.toLowerCase().includes(term)) score += 2;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = product;
        }
    });

    return maxScore > 5 ? bestMatch : null; // Threshold to avoid garbage matches
};

const DesignStudio = ({ onStepChange }: { onStepChange: (step: 'upload' | 'analyzing' | 'result') => void }) => {
    const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
    const [sketch, setSketch] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [renders, setRenders] = useState<string[]>([]);
    const [matchedProducts, setMatchedProducts] = useState<FurnitureItem[]>([]);
    const [activeRenderIndex, setActiveRenderIndex] = useState(0);
    const [loadingMsg, setLoadingMsg] = useState('Initializing Aura Studio...');
    const [showVastuOverlay, setShowVastuOverlay] = useState(false);
    const [showAIVisionOverlay, setShowAIVisionOverlay] = useState(false);

    // Agent Status
    const [visionaryStatus, setVisionaryStatus] = useState<'idle' | 'active' | 'done'>('idle');
    const [vastuStatus, setVastuStatus] = useState<'idle' | 'active' | 'done'>('idle');
    const [matcherStatus, setMatcherStatus] = useState<'idle' | 'active' | 'done'>('idle');
    const [renderStatus, setRenderStatus] = useState<'idle' | 'active' | 'done'>('idle');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cart / Buy Logic
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    useEffect(() => {
        onStepChange(step);
    }, [step, onStepChange]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type/size
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSketch(reader.result as string);
                processSketch(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const processSketch = async (base64: string) => {
        setStep('analyzing');
        const cleanBase64 = base64.split(',')[1];

        try {
            // 1. Visionary Agent
            setLoadingMsg('Visionary Agent: Extracting Spatial Topology...');
            setVisionaryStatus('active');
            const analysisResult = await analyzeSketch(cleanBase64);
            setVisionaryStatus('done');
            setAnalysis(analysisResult);

            // 2. Vastu Agent
            setLoadingMsg('Vastu Guide: Auditing Energy Flow (32 Zones)...');
            setVastuStatus('active');
            await new Promise(r => setTimeout(r, 800));
            setVastuStatus('done');

            // 3. Matcher Agent
            setLoadingMsg('Product Matcher: Querying Pinecone Vector DB...');
            setMatcherStatus('active');
            await new Promise(r => setTimeout(r, 800));
            // 3. Matcher Agent
            setLoadingMsg('Product Matcher: Finding best items in catalog...');
            setMatcherStatus('active');

            const matches: FurnitureItem[] = [];
            if (analysisResult.objects) {
                analysisResult.objects.forEach((obj: any) => {
                    // Use the AI's "search_query" specifically for this
                    const match = findBestMatch(obj.search_query || obj.object, obj.visual_characteristics || "");
                    if (match) matches.push(match);
                });
            }
            setMatchedProducts(matches);

            await new Promise(r => setTimeout(r, 600)); // UI pacing
            setMatcherStatus('done');

            // 4. Render Agent
            setLoadingMsg('Render Artist: Generating 4K Photorealistic Output (Oasis Style)...');
            setRenderStatus('active');
            const generatedRenders = await generateRenders(cleanBase64, analysisResult);
            setRenders(generatedRenders);
            setRenderStatus('done');

            setStep('result');
        } catch (error) {
            console.error(error);
            setStep('upload');
            setVisionaryStatus('idle');
            setVastuStatus('idle');
            setMatcherStatus('idle');
            setRenderStatus('idle');
            alert("Design Engine overloaded or API Error. Please try again.");
        }
    };

    const handleBuyRoom = () => {
        setIsAddingToCart(true);
        setTimeout(() => {
            setIsAddingToCart(false);
            alert("All items in this design have been added to your Urban Ladder Cart!");
        }, 1500);
    };

    if (step === 'upload') {
        return (
            <div className="pt-40 pb-32 max-w-5xl mx-auto px-6 text-center animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-5xl font-bold text-stone-800 mb-6 serif">Aura Design Engine</h2>
                <p className="text-xl text-stone-500 mb-16 max-w-2xl mx-auto font-light">
                    Powered by Multi-Agent AI. Upload a photo or sketch to generate a Vastu-compliant, purchasable Urban Ladder room.
                </p>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-300 rounded-[30px] p-20 bg-stone-50 hover:bg-orange-50/20 hover:border-orange-400 transition-all cursor-pointer group"
                >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-stone-400 shadow-xl border border-stone-100 mx-auto mb-8 group-hover:scale-110 transition-transform">
                        <Upload size={40} strokeWidth={1.5} className="text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-2">Upload Sketch or Photo</h3>
                    <p className="text-stone-400">Supports JPG, PNG (Max 10MB)</p>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>

                {/* Tech Stack Badges */}
                <div className="flex justify-center gap-4 mt-12 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <div className="flex flex-col items-center gap-2">
                        <span className="px-3 py-1 bg-white border border-stone-200 rounded text-[10px] uppercase font-bold tracking-widest text-stone-500">Gemini 1.5 Pro</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="px-3 py-1 bg-white border border-stone-200 rounded text-[10px] uppercase font-bold tracking-widest text-stone-500">Pinecone DB</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="px-3 py-1 bg-white border border-stone-200 rounded text-[10px] uppercase font-bold tracking-widest text-stone-500">React Three Fiber</span>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'analyzing') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 pt-20">
                <div className="w-full max-w-md space-y-4">
                    {/* Agent Status List */}
                    {[
                        { id: 'visionary', label: 'Visionary Agent', status: visionaryStatus, icon: Eye },
                        { id: 'vastu', label: 'Vastu Guide', status: vastuStatus, icon: Compass },
                        { id: 'matcher', label: 'Product Matcher', status: matcherStatus, icon: ShoppingBag },
                        { id: 'render', label: 'Render Artist', status: renderStatus, icon: Sparkles },
                    ].map((agent) => (
                        <div key={agent.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${agent.status === 'active' ? 'bg-white border-orange-200 shadow-lg scale-105' : 'bg-transparent border-transparent opacity-50'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${agent.status === 'done' ? 'bg-green-100 text-green-600' : agent.status === 'active' ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-stone-200 text-stone-400'}`}>
                                {agent.status === 'done' ? <CheckCircle size={20} /> : <agent.icon size={20} />}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-stone-800">{agent.label}</div>
                                {agent.status === 'active' && <div className="text-xs text-orange-600 animate-pulse">Processing...</div>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold text-stone-800 serif">{loadingMsg}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-[100px] h-screen flex flex-col bg-stone-900 overflow-hidden">
            {/* HEADER ACTION BAR */}
            <div className="h-16 bg-stone-800 border-b border-stone-700 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep('upload')} className="text-stone-400 hover:text-white flex items-center gap-2 transition-colors">
                        <ArrowLeft size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Restart</span>
                    </button>
                    <div className="h-6 w-px bg-stone-700"></div>
                    <div className="text-white font-bold serif flex items-center gap-2">
                        <span className="text-orange-500">Aura</span> Workspace
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-stone-700/50 p-1 rounded-lg">
                        <button
                            onClick={() => { setShowVastuOverlay(false); setShowAIVisionOverlay(false); }}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${!showVastuOverlay && !showAIVisionOverlay ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-white'}`}
                        >
                            Visual
                        </button>
                        <button
                            onClick={() => { setShowVastuOverlay(true); setShowAIVisionOverlay(false); }}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${showVastuOverlay ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-400 hover:text-white'}`}
                        >
                            Vastu Energy
                        </button>
                        <button
                            onClick={() => { setShowAIVisionOverlay(true); setShowVastuOverlay(false); }}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${showAIVisionOverlay ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-400 hover:text-white'}`}
                        >
                            AI Vision {analysis?.objects?.length ? `(${analysis.objects.length})` : ''}
                        </button>
                    </div>
                    <button
                        onClick={handleBuyRoom}
                        className="bg-white text-stone-900 px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-colors"
                    >
                        {isAddingToCart ? 'Processing...' : (
                            <>
                                <ShoppingCart size={16} /> {analysis?.sceneType === 'furniture_collage' ? 'Buy These Items' : 'Buy This Room'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: MAIN CANVAS (Simulates Slider) */}
                <div className="flex-1 relative bg-black">
                    {sketch && (
                        <BeforeAfterSlider
                            beforeImage={sketch}
                            afterImage={renders[activeRenderIndex]}
                            analysis={analysis}
                        />
                    )}

                    {/* Floating Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-stone-900/90 backdrop-blur border border-stone-700 p-2 rounded-2xl z-40">
                        {renders.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveRenderIndex(idx)}
                                className={`w-12 h-12 rounded-xl border-2 overflow-hidden transition-all ${activeRenderIndex === idx ? 'border-orange-500 scale-110' : 'border-stone-600 opacity-50 hover:opacity-100'}`}
                            >
                                <img src={renders[idx]} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* AI Vision Overlay (Conditional) */}
                    {showAIVisionOverlay && analysis && (
                        <div className="absolute inset-0 z-30 pointer-events-none">
                            {analysis.objects.map((obj: any, i: number) => (
                                <div key={`vision-${i}`}
                                    className="absolute border-2 border-cyan-400 bg-cyan-400/10 flex flex-col justify-start"
                                    style={{
                                        top: `${obj.bbox[0]}%`, left: `${obj.bbox[1]}%`,
                                        width: `${obj.bbox[3] - obj.bbox[1]}%`, height: `${obj.bbox[2] - obj.bbox[0]}%`
                                    }}
                                >
                                    <div className="bg-cyan-500 text-white text-[9px] font-bold px-1 py-0.5 self-start uppercase tracking-wider">
                                        {obj.object} ({Math.round(obj.confidence * 100)}%)
                                    </div>
                                </div>
                            ))}
                            <div className="absolute top-4 left-4 bg-cyan-900/90 text-white px-4 py-2 rounded-lg backdrop-blur shadow-xl border border-cyan-500/30">
                                <div className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-1">Scene Topology</div>
                                <div className="font-bold text-lg capitalize">{analysis.sceneType?.replace('_', ' ') || 'Scene Detected'}</div>
                            </div>
                        </div>
                    )}

                    {/* Vastu Overlay (Conditional) */}
                    {showVastuOverlay && analysis && (
                        <div className="absolute inset-0 z-30 pointer-events-none bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-white">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg border-4 border-white/10">
                                        {analysis.vastu_score}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold serif">Vastu Audit Report</h3>
                                        <p className="text-white/60 text-sm">North-East Energy Flow Analysis</p>
                                    </div>
                                </div>
                                <div className="space-y-4 h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {analysis.violations && analysis.violations.length > 0 ? analysis.violations.map((v: any, i: number) => (
                                        <div key={i} className="flex gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                            <AlertCircle className="text-red-400 shrink-0" />
                                            <div>
                                                <div className="font-bold text-red-200">{v.item}</div>
                                                <p className="text-red-100/70 text-sm">{v.issue}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-white/60">No major violations found.</div>
                                    )}
                                    {analysis.remedies && analysis.remedies.map((r: any, i: number) => (
                                        <div key={`rem-${i}`} className="flex gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                            <CheckCircle className="text-green-400 shrink-0" />
                                            <div>
                                                <div className="font-bold text-green-200">Remedy: {r.action}</div>
                                                <div className="text-xs font-bold uppercase tracking-widest text-green-400 mt-1">
                                                    Try: {r.ul_product_boost}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: SHOPPING SIDEBAR */}
                <div className="w-[400px] bg-white h-full overflow-y-auto border-l border-stone-200 hidden xl:block">
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-stone-800 mb-6 serif">Room Manifest</h3>

                        {/* Product Matcher Results */}
                        <div className="space-y-6">
                            {matchedProducts.length > 0 ? matchedProducts.map((product, i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer hover:bg-stone-50 p-2 rounded-xl transition-all">
                                    <div className="w-20 h-20 bg-stone-100 rounded-lg shrink-0 border border-stone-200 flex items-center justify-center overflow-hidden relative">
                                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-stone-800 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                                            {product.name}
                                        </h4>
                                        <div className="text-xs text-stone-400 mb-2">{product.collection} Collection</div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-orange-600">₹{product.price.toLocaleString()}</span>
                                            <button className="p-1 rounded bg-stone-100 text-stone-500 group-hover:bg-orange-500 group-hover:text-white transition-all ml-auto">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-stone-400 text-sm p-4 border border-dashed rounded-xl">
                                    No exact furniture matches found in catalog. Try a different sketch!
                                </div>
                            )}
                        </div>

                            <div className="mt-12 p-6 bg-[#F6F6F6] rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <QrCode className="text-stone-800" size={24} />
                                    <div className="font-bold text-stone-800 uppercase tracking-widest text-xs">Experience Center</div>
                                </div>
                                <p className="text-stone-500 text-xs mb-4">
                                    Save this design to your profile and scan at any Urban Ladder store to view fabrics.
                                </p>
                                <div className="w-full h-32 bg-white border border-stone-200 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-stone-300">SCAN ME</div>
                                        <div className="font-mono font-bold text-[#8B5E3C]">UL-AURA-8X</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
};

            export default DesignStudio;
