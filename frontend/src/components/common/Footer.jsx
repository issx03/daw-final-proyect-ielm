import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-20 px-6 border-t border-slate-100 bg-white">
      <div className="w-full max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-6 group">
              <span className="font-bold text-2xl tracking-tighter text-slate-900 font-['Outfit'] select-none">
                Trellix<span className="text-slate-400">.</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium">
              A clean, focused workspace for teams that get things done.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[10px] text-slate-900 mb-6 uppercase tracking-[0.2em]">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-tight">Capabilities</a></li>
              <li><Link to="/register" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-tight">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[10px] text-slate-900 mb-6 uppercase tracking-[0.2em]">Ecosystem</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-tight">Documentation</a></li>
              <li><a href="#" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-tight">Enterprise</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © {new Date().getFullYear()} Trellix. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
