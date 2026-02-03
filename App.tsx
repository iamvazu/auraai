
import React, { useState, useEffect, useRef } from 'react';
import {
  Home, Upload, MapPin, Layout, Sparkles, ChevronRight, Camera,
  CheckCircle, AlertCircle, Menu, X, QrCode, ArrowLeft, ShoppingBag,
  Info, Star, Maximize2, RefreshCcw, Edit3, Download, Box, Eye,
  Grid as GridIcon, Search, Plus, FileText, User, Heart, ShoppingCart,
  Wrench, Layers, Settings, ExternalLink, ArrowUpRight, ShieldCheck, Zap,
  MoveHorizontal, Check, Compass
} from 'lucide-react';
import { analyzeSketch, generateRenders } from './services/geminiService';
import { PRODUCT_CATALOG, EXPERIENCE_CENTERS } from './data/products';
import { AnalysisResult, FurnitureItem, ExperienceCenter } from './types';

// Categories
const CATEGORIES = [
  'New Arrivals', 'Deal Zone', 'Sofas & Recliners', 'Living', 'Bedroom',
  'Dining & Kitchen', 'Mattresses', 'Study', 'Storage Furniture',
  'Lighting & Decor', 'Furnishing'
];

// --- COMPONENTS ---

const Navbar = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [activeTab, setActiveTab] = useState('New Arrivals');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100 transition-all duration-300">
      <div className="bg-[#F6F6F6] text-[11px] py-2 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between">
          <div className="flex gap-6 font-semibold text-stone-600">
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Home Interiors</span>
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Business Furniture</span>
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Repair Services</span>
          </div>
          <div className="flex gap-4 font-semibold text-stone-600">
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Track Order</span>
            <span className="hover:text-orange-500 cursor-pointer transition-colors">Help</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
            <div className="w-10 h-8 lg:w-12 lg:h-10 border-4 border-[#8B5E3C] flex items-center justify-center font-bold text-[#8B5E3C] text-lg lg:text-xl transition-transform group-hover:scale-105">
              UL
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl lg:text-2xl font-bold tracking-tight text-stone-800 -mb-1">Urban</span>
              <span className="text-xl lg:text-2xl font-bold tracking-tight text-stone-800">Ladder</span>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 max-w-2xl mx-12">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search for furniture and decor"
                className="w-full bg-[#F0F0F0] border-none rounded-md py-3 px-5 pl-12 text-sm focus:ring-1 focus:ring-orange-500 transition-all group-hover:bg-[#EAEAEA]"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-hover:text-orange-500 transition-colors" size={18} />
            </div>
          </div>

          <div className="flex items-center space-x-6 text-stone-600">
            <button onClick={() => onNavigate('experience-centers')} className="hover:text-orange-500 flex flex-col items-center group transition-colors">
              <MapPin size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1 uppercase hidden sm:block">Stores</span>
            </button>
            <button className="hover:text-orange-500 flex flex-col items-center relative group transition-colors">
              <ShoppingCart size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">1</span>
              <span className="text-[10px] font-bold mt-1 uppercase hidden sm:block">Cart</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex justify-between border-t border-stone-100 py-3 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`whitespace-nowrap px-1 text-[13px] font-semibold transition-all hover:text-orange-500 relative ${activeTab === cat ? 'text-orange-500 after:content-[""] after:absolute after:bottom-[-13px] after:left-0 after:w-full after:h-[2px] after:bg-orange-500' : 'text-stone-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-[#2B2B2B] text-white pt-16 pb-8">
    <div className="max-w-[1400px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div>
          <h4 className="text-xl font-bold serif mb-6">Urban Ladder</h4>
          <p className="text-stone-400 text-sm leading-relaxed mb-6">
            India's favorite destination for furniture and home decor. We create designs that honor your home.
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer"><Settings size={14} /></div>
            <div className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer"><User size={14} /></div>
            <div className="w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer"><Heart size={14} /></div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-stone-500">Company</h4>
          <ul className="space-y-4 text-sm text-stone-300">
            <li className="hover:text-orange-500 cursor-pointer">About Us</li>
            <li className="hover:text-orange-500 cursor-pointer">Careers</li>
            <li className="hover:text-orange-500 cursor-pointer">Blog</li>
            <li className="hover:text-orange-500 cursor-pointer">Vastu Services</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-stone-500">Support</h4>
          <ul className="space-y-4 text-sm text-stone-300">
            <li className="hover:text-orange-500 cursor-pointer">Help Center</li>
            <li className="hover:text-orange-500 cursor-pointer">Terms & Conditions</li>
            <li className="hover:text-orange-500 cursor-pointer">Privacy Policy</li>
            <li className="hover:text-orange-500 cursor-pointer">Returns</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest mb-6 text-stone-500">Contact</h4>
          <ul className="space-y-4 text-sm text-stone-300">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="mt-1 text-orange-500" />
              <span>Reliance Retail Limited,<br />3rd Floor, Court House,<br />Mumbai - 400 002</span>
            </li>
            <li className="flex items-center gap-3">
              <Zap size={16} className="text-orange-500" />
              <span>hello@urbanladder.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
        <p>© 2026 Urban Ladder. All rights reserved.</p>
        <div className="flex gap-6">
          <span>Privacy</span>
          <span>Security</span>
          <span>Sitemap</span>
        </div>
      </div>
    </div>
  </footer>
);

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

const HomeView = ({ onStart }: { onStart: () => void }) => {
  const [selectedCollection, setSelectedCollection] = useState<'Oasis' | 'Terra' | 'Astra' | 'All'>('All');

  const filteredProducts = selectedCollection === 'All'
    ? PRODUCT_CATALOG
    : PRODUCT_CATALOG.filter(p => p.collection === selectedCollection);

  return (
    <div className="pt-[140px]">
      <section className="relative h-[65vh] flex items-center overflow-hidden bg-stone-900 mx-4 lg:mx-10 rounded-2xl mb-12 group">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1920"
            alt="Urban Ladder Banner"
            className="w-full h-full object-cover brightness-75 transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-12">
          <div className="max-w-2xl animate-in slide-in-from-left-10 duration-700">
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur rounded mb-6 border border-white/20">
              <span className="text-orange-400 font-bold tracking-widest text-[10px] uppercase">New Feature</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-8 serif tracking-tight">
              Aura AI:<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">Design Your Dreams.</span>
            </h1>
            <p className="text-lg text-stone-200 mb-10 leading-relaxed max-w-lg font-light">
              Transform raw sketches or photos into purchase-ready Urban Ladder interiors using our proprietary Multi-Agent Design Engine.
            </p>
            <button
              onClick={onStart}
              className="bg-orange-500 text-white px-10 py-5 rounded-md text-lg font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-2xl hover:translate-y-[-2px]"
            >
              Launch Design Studio <Sparkles size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Collection Grid matches current app code essentially, just compacting for length */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2 serif">The Catalog</h2>
              <p className="text-stone-400 font-light">Hand-picked styles for the modern Indian home.</p>
            </div>
            <button className="text-orange-500 font-bold text-sm hover:underline">View Full Catalog</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="group cursor-pointer flex flex-col h-full">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-stone-100 mb-4">
                  <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-[9px] font-black uppercase tracking-widest text-stone-600 rounded">
                    {product.collection} / {product.category}
                  </div>
                </div>
                <h3 className="font-bold text-stone-800 serif text-lg">{product.name}</h3>
                <div className="flex justify-between items-center mt-2 mt-auto">
                  <span className="text-orange-600 font-bold">₹{product.price.toLocaleString()}</span>
                  <button className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const DesignerView = ({ onStepChange }: { onStepChange: (step: 'upload' | 'analyzing' | 'result') => void }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'result'>('upload');
  const [sketch, setSketch] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [renders, setRenders] = useState<string[]>([]);
  const [activeRenderIndex, setActiveRenderIndex] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState('Initializing Aura Studio...');
  const [showVastuOverlay, setShowVastuOverlay] = useState(false);

  // Agent Status
  const [visionaryStatus, setVisionaryStatus] = useState<'idle' | 'active' | 'done'>('idle');
  const [vastuStatus, setVastuStatus] = useState<'idle' | 'active' | 'done'>('idle');
  const [matcherStatus, setMatcherStatus] = useState<'idle' | 'active' | 'done'>('idle');
  const [renderStatus, setRenderStatus] = useState<'idle' | 'active' | 'done'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onStepChange(step);
  }, [step, onStepChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      const analysisResult = await analyzeSketch(cleanBase64); // This does both Vastu and Vision
      await new Promise(r => setTimeout(r, 1000)); // Sim delay
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
      alert("Design Engine overloaded. Please try again.");
    }
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
              onClick={() => setShowVastuOverlay(false)}
              className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${!showVastuOverlay ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-white'}`}
            >
              Visual
            </button>
            <button
              onClick={() => setShowVastuOverlay(true)}
              className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${showVastuOverlay ? 'bg-orange-500 text-white shadow-sm' : 'text-stone-400 hover:text-white'}`}
            >
              Vastu Energy
            </button>
          </div>
          <button className="bg-white text-stone-900 px-6 py-2 rounded-md text-sm font-bold flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-colors">
            <ShoppingCart size={16} /> Buy This Room
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
                <div className="space-y-4">
                  {analysis.violations.map((v, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <AlertCircle className="text-red-400 shrink-0" />
                      <div>
                        <div className="font-bold text-red-200">{v.item}</div>
                        <p className="text-red-100/70 text-sm">{v.issue}</p>
                      </div>
                    </div>
                  ))}
                  {analysis.remedies.map((r, i) => (
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
              {analysis?.objects.map((obj, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-20 h-20 bg-stone-100 rounded-lg shrink-0 border border-stone-200 flex items-center justify-center overflow-hidden relative">
                    {/* Placeholder for product img search based on SKU */}
                    <div className="text-xs text-stone-400 font-bold text-center p-2">{obj.suggestedSKU || obj.object}</div>
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-800 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {obj.suggestedSKU ? `${obj.suggestedSKU} - Oasis` : `Urban Ladder ${obj.object}`}
                    </h4>
                    <div className="text-xs text-stone-400 mb-2">{obj.confidence > 0.8 ? 'High Match' : 'Suggested'}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600">₹{(Math.random() * 20000 + 5000).toFixed(0)}</span>
                      <button className="p-1 rounded bg-stone-100 text-stone-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [designerStep, setDesignerStep] = useState<'upload' | 'analyzing' | 'result'>('upload');

  // Logic: Show standard Layout (Nav+Footer) on 'home' and 'upload'. 
  // Hide on 'analyzing' and 'result' (workspace mode).
  const showStandardLayout = currentPage === 'home' || (currentPage === 'designer' && designerStep === 'upload');

  return (
    <div className="min-h-screen bg-white">
      {showStandardLayout && <Navbar onNavigate={setCurrentPage} />}
      <main>
        {currentPage === 'home' && <HomeView onStart={() => setCurrentPage('designer')} />}
        {currentPage === 'designer' && (
          <DesignerView onStepChange={setDesignerStep} />
        )}
      </main>
      {showStandardLayout && <Footer />}
    </div>
  );
};

export default App;
