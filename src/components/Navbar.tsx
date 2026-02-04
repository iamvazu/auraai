
import React, { useState } from 'react';
import { Search, MapPin, ShoppingCart } from 'lucide-react';

const CATEGORIES = [
    'New Arrivals', 'Deal Zone', 'Sofas & Recliners', 'Living', 'Bedroom',
    'Dining & Kitchen', 'Mattresses', 'Study', 'Storage Furniture',
    'Lighting & Decor', 'Furnishing'
];

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

export default Navbar;
