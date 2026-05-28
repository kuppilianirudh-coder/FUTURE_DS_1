/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { generateSyntheticDataset } from './dataGenerator.js';
import { SalesRecord, MainTab } from './types.js';
import DashboardTab from './components/DashboardTab.js';
import NotebookTab from './components/NotebookTab.js';
import CompilerTab from './components/CompilerTab.js';
import ExecutiveReportTab from './components/ExecutiveReportTab.js';
import GithubTab from './components/GithubTab.js';
import { 
  LineChart as ChartIcon, 
  BookOpen, 
  Terminal, 
  FileText, 
  Github, 
  Loader2, 
  Database,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load dataset from backend API, fallback to client-side generation instantly if any failure
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sales/data');
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          setSalesData(resJson.data);
        } else {
          // Heuristic client fallback
          console.warn("Express endpoint returned non-success payload. Sourcing client engine fallback.");
          const localData = generateSyntheticDataset(1000, 54321);
          setSalesData(localData);
        }
      } catch (err) {
        console.warn("Server API not reachable yet. Sourcing reliable locally generated dataset.");
        const localData = generateSyntheticDataset(1000, 54321);
        setSalesData(localData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const triggerDownloadCSV = () => {
    // Initiate direct download call to backend express route
    window.open('/api/sales/download-csv', '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 text-sky-400 animate-spin mb-4" />
        <p className="text-sm font-mono tracking-wider text-slate-400 animate-pulse lowercase uppercase">Compiling BI analytics workspace framework...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500/20 relative overflow-x-hidden">
      
      {/* 🔮 Frosted Glass Ambient Blur Background Spheres */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-blue-600 rounded-full blur-[120px] opacity-25 pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-100px] w-96 h-96 bg-purple-600 rounded-full blur-[150px] opacity-25 pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[20%] w-72 h-72 bg-sky-600 rounded-full blur-[130px] opacity-10 pointer-events-none z-0"></div>

      {/* 🌌 High-fidelity Top Global Header (Frosted Glass Translucent Design) */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 px-4 py-3 print:hidden shadow-xl shadow-slate-950/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg ring-1 ring-white/20">
              <ChartIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white tracking-tight text-base">BI Performance Analytics Suite</h1>
                <span className="text-[10px] font-mono bg-white/10 text-blue-300 px-2 py-0.5 rounded border border-white/10">
                  v1.4.2
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">DATA SCIENCE PORTFOLIO • REPOSITORY: FUTURE_DS_01</p>
            </div>
          </div>

          {/* Sourcing State Indicators */}
          <div className="flex items-center gap-3 self-end md:self-auto text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-slate-300">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Rows Sourced: <strong className="text-white">{salesData.length}</strong></span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-blue-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="text-slate-200">Gemini Intel Guarded</span>
            </div>
          </div>

        </div>
      </header>

      {/* 🧭 Global Workspace Tab Controller (Translucent Glass) */}
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 px-4 py-2 sticky top-[61px] z-40 print:hidden shadow-lg shadow-slate-950/10">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-1.5 scrollbar-none py-1">
          
          {/* Dashboard Button */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-600 text-white border border-blue-455/30 shadow-lg shadow-blue-550/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <ChartIcon className="w-4 h-4" />
            <span>Interactive Stats Dashboard</span>
          </button>

          {/* Jupyter Notebook Button */}
          <button 
            onClick={() => setActiveTab('notebook')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'notebook' ? 'bg-blue-600 text-white border border-blue-455/30 shadow-lg shadow-blue-550/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Jupyter Notebook Simulation</span>
          </button>

          {/* Python CLI */}
          <button 
            onClick={() => setActiveTab('python-cli')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'python-cli' ? 'bg-blue-600 text-white border border-blue-455/30 shadow-lg shadow-blue-550/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Terminal className="w-4 h-4" />
            <span>Python Compiler Shell</span>
          </button>

          {/* Executive Brief */}
          <button 
            onClick={() => setActiveTab('client-report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'client-report' ? 'bg-blue-600 text-white border border-blue-455/30 shadow-lg shadow-blue-550/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Advisory Print Brief (PDF)</span>
          </button>

          {/* GitHub Mock */}
          <button 
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'github' ? 'bg-blue-600 text-white border border-blue-455/30 shadow-lg shadow-blue-550/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Repository Mockup</span>
          </button>

        </div>
      </nav>

      {/* 🎪 Main Functional View Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 print:py-0 relative z-10">
        
        {activeTab === 'dashboard' && (
          <DashboardTab dataset={salesData} onTriggerDownload={triggerDownloadCSV} />
        )}

        {activeTab === 'notebook' && (
          <NotebookTab onDownloadCSV={triggerDownloadCSV} />
        )}

        {activeTab === 'python-cli' && (
          <CompilerTab />
        )}

        {activeTab === 'client-report' && (
          <ExecutiveReportTab dataset={salesData} />
        )}

        {activeTab === 'github' && (
          <GithubTab onDownloadCSV={triggerDownloadCSV} />
        )}

      </main>

      {/* 📑 Minimal Corporate Page footer */}
      <footer className="border-t border-slate-900 mt-16 py-8 px-4 text-center print:hidden bg-slate-950/40">
        <p className="text-xs text-slate-500 font-mono tracking-wide">
          Enterprise Sales Performance Business Intelligence Workspace © {new Date().getFullYear()} • Sourced for FUTURE_DS_01 Data Science Portfolio.
        </p>
      </footer>

    </div>
  );
}
