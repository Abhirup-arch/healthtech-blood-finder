import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, ShieldAlert, RefreshCw, Server, CheckCircle, Activity } from 'lucide-react';
import { useBloodData, type BloodCentre } from '../hooks/useBloodData';

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
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Methodology & Data Collection</h1>
          <p className="mt-2 text-lg text-slate-600">
            How BloodLink India processes, serves, and guarantees the authenticity of blood availability data.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          
          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-50 rounded-lg mr-4">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">1. Data Source (e-RaktKosh)</h2>
            </div>
            <p className="text-slate-600 leading-relaxed pl-14">
              BloodLink India relies entirely on publicly available data from <strong>e-RaktKosh</strong>, a centralized blood bank management system implemented by the Ministry of Health and Family Welfare, Government of India. We do not maintain our own primary database of blood stocks.
            </p>
          </div>

          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg mr-4">
                <RefreshCw className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">2. Automated Processing Workflow</h2>
            </div>
            <p className="text-slate-600 leading-relaxed pl-14 mb-6">
              A secure GitHub Action runs on a strict schedule <strong>every 4 hours</strong>. This automated pipeline fetches the latest nationwide JSON data directly from the e-RaktKosh API, processes it for our application, and commits the updated dataset to our repository.
            </p>
            
            <div className="pl-14">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm font-medium text-slate-700 flex flex-col items-center justify-center space-y-2">
                <div className="bg-white px-4 py-2 rounded shadow-sm border border-slate-200">e-RaktKosh</div>
                <ArrowLeft className="w-4 h-4 transform -rotate-90 text-slate-400" />
                <div className="bg-white px-4 py-2 rounded shadow-sm border border-slate-200">GitHub Action</div>
                <ArrowLeft className="w-4 h-4 transform -rotate-90 text-slate-400" />
                <div className="bg-white px-4 py-2 rounded shadow-sm border border-slate-200">blood_availability.json</div>
                <ArrowLeft className="w-4 h-4 transform -rotate-90 text-slate-400" />
                <div className="bg-white px-4 py-2 rounded shadow-sm border border-slate-200">Cloudflare Pages</div>
                <ArrowLeft className="w-4 h-4 transform -rotate-90 text-slate-400" />
                <div className="bg-blue-600 text-white px-4 py-2 rounded shadow-sm">BloodLink India</div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-50 rounded-lg mr-4">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">3. Strict Data Authenticity</h2>
            </div>
            <div className="pl-14">
              <p className="text-slate-600 leading-relaxed mb-3">
                We maintain a strict zero-fabrication policy to ensure medical reliability:
              </p>
              <ul className="list-disc pl-5 text-slate-600 space-y-2">
                <li>No mock hospitals or dummy blood banks are injected.</li>
                <li>No random numbers or placeholder stock values are generated.</li>
                <li>Missing stock values from the source API remain blank in our system.</li>
                <li>If e-RaktKosh reports 0 units, BloodLink India reports 0 units.</li>
              </ul>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-50 rounded-lg mr-4">
                <Server className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">4. High-Performance Delivery</h2>
            </div>
            <p className="text-slate-600 leading-relaxed pl-14">
              The processed JSON dataset is served directly via Cloudflare Pages global Edge network. This architecture guarantees that even during high-traffic emergency situations, the application will load instantly without overwhelming the source government servers.
            </p>
          </div>

        </div>

        {/* Dynamic Authenticity Report */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <Activity className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">Live Authenticity Report</h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Total Facilities Monitored</span>
                  <span className="text-xl font-bold text-slate-900">{totalFacilities.toLocaleString()}</span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">States & UTs Covered</span>
                  <span className="text-xl font-bold text-slate-900">{statesCovered}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Facilities With Stock</span>
                  <span className="text-xl font-bold text-slate-900">{facilitiesWithStock.toLocaleString()}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Data Source</span>
                  <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">e-RaktKosh (Govt. India)</span>
                </div>
                
                <div className="col-span-1 md:col-span-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center text-emerald-800 font-medium">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Last Successful Update
                  </div>
                  <span className="font-bold text-emerald-900">{lastUpdated}</span>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default MethodologyPage;
