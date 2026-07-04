import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, ShieldAlert, RefreshCw, Server } from 'lucide-react';

const MethodologyPage: React.FC = () => {
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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
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
              <h2 className="text-xl font-semibold text-slate-900">2. Automated Processing</h2>
            </div>
            <p className="text-slate-600 leading-relaxed pl-14">
              A secure GitHub Action runs on a strict schedule <strong>every 4 hours</strong>. This automated pipeline fetches the latest nationwide JSON data directly from the e-RaktKosh API, processes it for our application, and commits the updated dataset to our repository.
            </p>
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
                <li>No mock blood banks or placeholder locations are injected.</li>
                <li>No random numbers or stock values are generated.</li>
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

      </div>
    </div>
  );
};

export default MethodologyPage;
