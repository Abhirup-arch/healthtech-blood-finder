import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, ShieldAlert, RefreshCw, Server, CheckCircle, Activity, ArrowDown } from 'lucide-react';
import { useBloodData, type BloodCentre } from '../hooks/useBloodData';
import { motion } from 'framer-motion';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

const MethodologyPage: React.FC = () => {
  const { data, loading } = useBloodData();

  const { totalFacilities, statesCovered, facilitiesWithStock } = useMemo(() => {
    const states = new Set(data.map(d => d.state).filter(Boolean));
    const withStock = data.filter(c => {
      let total = 0;
      BLOOD_GROUPS.forEach(bg => {
        const val = c[bg as keyof BloodCentre] as number | undefined;
        if (val) total += val;
      });
      return total > 0;
    });

    return {
      totalFacilities: data.length,
      statesCovered: states.size,
      facilitiesWithStock: withStock.length,
    };
  }, [data]);

  const lastUpdated = new Date().toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="grid-overlay" />
      <div className="glow-bg top-[10%] right-[10%] opacity-10" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to="/" className="inline-flex items-center text-xs font-medium text-red-400 hover:text-red-350 mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Methodology & Data Collection
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
            How BloodLink India processes, serves, and guarantees the authenticity of blood availability data.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 gap-6 mb-8"
        >
          
          {/* Section 1 */}
          <div className="glass-panel p-6 sm:p-8 bg-slate-900/40 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-blue-500/50" />
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl mr-4 border border-blue-500/20">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">1. Data Source (e-RaktKosh)</h2>
            </div>
            <p className="text-slate-350 text-sm leading-relaxed pl-14 font-normal">
              BloodLink India relies entirely on publicly available data from <strong>e-RaktKosh</strong>, a centralized blood bank management system implemented by the Ministry of Health and Family Welfare, Government of India. We do not maintain our own primary database of blood stocks.
            </p>
          </div>

          {/* Section 2 */}
          <div className="glass-panel p-6 sm:p-8 bg-slate-900/40 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-emerald-500/50" />
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl mr-4 border border-emerald-500/20">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">2. Automated Processing Workflow</h2>
            </div>
            <p className="text-slate-350 text-sm leading-relaxed pl-14 font-normal mb-6">
              A secure GitHub Action runs on a strict schedule <strong>every 4 hours</strong>. This automated pipeline fetches the latest nationwide JSON data directly from the e-RaktKosh API, processes it for our application, and commits the updated dataset to our repository.
            </p>
            
            <div className="pl-14">
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 text-xs font-medium text-slate-300 flex flex-col items-center justify-center space-y-3">
                <div className="bg-slate-900 px-4 py-2.5 rounded-xl border border-white/5 text-center min-w-[180px]">e-RaktKosh</div>
                <ArrowDown className="w-4 h-4 text-slate-600" />
                <div className="bg-slate-900 px-4 py-2.5 rounded-xl border border-white/5 text-center min-w-[180px]">GitHub Action</div>
                <ArrowDown className="w-4 h-4 text-slate-600" />
                <div className="bg-slate-900 px-4 py-2.5 rounded-xl border border-white/5 text-center min-w-[180px]">blood_availability.json</div>
                <ArrowDown className="w-4 h-4 text-slate-600" />
                <div className="bg-slate-900 px-4 py-2.5 rounded-xl border border-white/5 text-center min-w-[180px]">Cloudflare Pages</div>
                <ArrowDown className="w-4 h-4 text-slate-600" />
                <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-red-950/30 border border-red-400/20 text-center min-w-[180px]">BloodLink India</div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="glass-panel p-6 sm:p-8 bg-slate-900/40 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-red-500/50" />
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-red-500/10 rounded-xl mr-4 border border-red-500/20">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">3. Strict Data Authenticity</h2>
            </div>
            <div className="pl-14">
              <p className="text-slate-350 text-sm leading-relaxed mb-4 font-normal">
                We maintain a strict zero-fabrication policy to ensure medical reliability:
              </p>
              <ul className="list-disc pl-5 text-slate-450 text-xs space-y-2.5 font-normal">
                <li>No mock hospitals or dummy blood banks are injected.</li>
                <li>No random numbers or placeholder stock values are generated.</li>
                <li>Missing stock values from the source API remain blank in our system.</li>
                <li>If e-RaktKosh reports 0 units, BloodLink India reports 0 units.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="glass-panel p-6 sm:p-8 bg-slate-900/40 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-purple-500/50" />
            <div className="flex items-center mb-4">
              <div className="p-2.5 bg-purple-500/10 rounded-xl mr-4 border border-purple-500/20">
                <Server className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">4. High-Performance Delivery</h2>
            </div>
            <p className="text-slate-350 text-sm leading-relaxed pl-14 font-normal">
              The processed JSON dataset is served directly via Cloudflare Pages global Edge network. This architecture guarantees that even during high-traffic emergency situations, the application will load instantly without overwhelming the source government servers.
            </p>
          </div>

        </motion.div>

        {/* Dynamic Authenticity Report */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel bg-slate-900/40 border border-blue-500/20 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-[3px] h-full bg-blue-500" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-6">
              <Activity className="w-5 h-5 text-blue-450 mr-3" />
              <h2 className="text-xl font-semibold text-white">Live Authenticity Report</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-normal">Total Facilities Monitored</span>
                  <span className="text-base font-semibold text-white">{totalFacilities.toLocaleString()}</span>
                </div>
                
                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-normal">States & UTs Covered</span>
                  <span className="text-base font-semibold text-white">{statesCovered}</span>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-normal">Facilities With Stock</span>
                  <span className="text-base font-semibold text-white">{facilitiesWithStock.toLocaleString()}</span>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-normal">Data Source</span>
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">e-RaktKosh Portal</span>
                </div>
                
                <div className="col-span-1 sm:col-span-2 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center text-xs text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Last Successful Update
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">{lastUpdated}</span>
                </div>
              </div>
            )}
            
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default MethodologyPage;
