import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, Users, ArrowRight, Check, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { token } = useAuth();

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-slate-900 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        {/* Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[700px] bg-slate-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-30 -z-20" />
        
        <div className="max-w-5xl mx-auto text-center reveal-staggered">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">
            <Check className="w-3 h-3 text-emerald-500" /> Designed for Focus
          </div>
          <h1 className="text-6xl md:text-[5.5rem] font-bold mb-8 leading-[1.05] tracking-tight text-slate-900 font-['Outfit']">
            Management <br />
            <span className="text-slate-400">for the Precise.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Strip away the noise. Trellix delivers a clean Kanban experience 
            built for teams that value clarity, speed, and getting things done.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-xl font-bold text-base shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] group uppercase tracking-widest text-xs">
              Start for Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-10 py-4 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all rounded-xl border border-slate-100">
              See How It Works
            </a>
          </div>
        </div>

        {/* Board Preview Image */}
        <div id="preview" className="mt-32 max-w-5xl mx-auto reveal-item">
          <img 
            src="/images/landing_mockup.png" 
            alt="Trellix board preview" 
            className="w-full rounded-[2.5rem] border border-slate-200 shadow-[0_40px_80px_-15px_rgba(15,23,42,0.1)]"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-4 font-['Outfit'] tracking-tight text-slate-900">Built for Focus</h2>
            <p className="text-slate-500 font-medium">
              Everything you need to stay organized. Nothing you don't.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate-900 transition-colors duration-300">
                <Box className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-['Outfit'] text-slate-900">Instant Overview</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                See your entire workflow at a glance. Organize boards, lists, and cards the way your team thinks.
              </p>
            </div>

            <div className="p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate-900 transition-colors duration-300">
                <Shield className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-['Outfit'] text-slate-900">Privacy by Design</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Your data stays yours. Encrypted, authenticated, and never shared with third parties.
              </p>
            </div>

            <div className="p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate-900 transition-colors duration-300">
                <Users className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-4 font-['Outfit'] text-slate-900">Real-Time Teamwork</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Move cards together, see changes live. No refreshing, no waiting — just smooth collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;

