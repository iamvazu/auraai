
import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { PRODUCT_CATALOG } from '../data/products';

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

            <section className="py-20 bg-white">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-stone-800 mb-2 serif">The Catalog</h2>
                            <p className="text-stone-400 font-light">Hand-picked styles for the modern Indian home.</p>
                        </div>
                        <button onClick={() => setSelectedCollection('All')} className="text-orange-500 font-bold text-sm hover:underline">View Full Catalog</button>
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

export default HomeView;
