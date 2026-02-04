
import React from 'react';
import { Settings, User, Heart, MapPin, Zap } from 'lucide-react';

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

export default Footer;
