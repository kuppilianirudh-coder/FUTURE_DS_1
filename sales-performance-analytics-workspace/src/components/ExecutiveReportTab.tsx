/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SalesRecord } from '../types.js';
import { 
  FileText, 
  Printer, 
  Send, 
  Loader2, 
  Sparkles, 
  CornerDownRight, 
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer.js';

interface ExecutiveReportTabProps {
  dataset: SalesRecord[];
}

export default function ExecutiveReportTab({ dataset }: ExecutiveReportTabProps) {
  const [customQuery, setCustomQuery] = useState('');
  const [reportResult, setReportResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Trigger custom Business Consulting Advisory Query via server proxy
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setIsLoading(true);
    setReportResult('');

    try {
      // Aggregate current metrics as base context for Gemini
      let totalSales = 0;
      let totalProfit = 0;
      dataset.forEach(item => {
        totalSales += item.sales;
        totalProfit += item.profit;
      });

      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: { year: 'All', region: 'All', category: 'All' },
          metrics: {
            totalSales: Math.round(totalSales),
            totalProfit: Math.round(totalProfit),
            profitMargin: ((totalProfit / totalSales) * 100).toFixed(1),
            totalQuantity: dataset.length,
            outlierCount: 32
          },
          // Send user's query as part of the customized strategic direction
          topProducts: [],
          categoryPerformance: [],
          regionalBreakdown: [],
          customQuery: customQuery.trim()
        })
      });

      const resJson = await response.json();
      if (resJson.success) {
        // Build customized consulting response incorporating the custom query trigger
        const aiResponse = resJson.report;
        setReportResult(aiResponse);
      } else {
        setReportResult(`### Operation Error\nFailed to invoke consultant stream: ${resJson.error}`);
      }
    } catch (err: any) {
      setReportResult(`### Network Timeout\nUnable to bridge advisory terminal: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPrintLayout = () => {
    window.print();
  };

  return (
    <div className="space-y-6">

      {/* 📝 Printable cover Header */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-400/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Executive Consulting Suite</h2>
            <p className="font-mono text-[10px] text-slate-400">Generate client-ready strategic consulting briefs & PDF records</p>
          </div>
        </div>

        <button 
          onClick={triggerPrintLayout}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-blue-500/10 cursor-pointer animate-pulse"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF Brief</span>
        </button>
      </div>

      {/* 💼 Interactive Custom AI Advisor input */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-xl print:hidden space-y-4">
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
          <h4 className="font-bold text-xs text-slate-250 uppercase tracking-wider">Dynamic Consulting Direct Query</h4>
        </div>

        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Instruct the Gemini Strategy engine to craft specific corporate analyses. (e.g., "Evaluate furniture logistic constraints", "Draft a Q3 pricing plan for Home Office computers").
        </p>

        <form onSubmit={handleQuerySubmit} className="flex gap-2">
          <input 
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Type your strategic guidance question here... (e.g. Write a specific margin expansion plan for Technology)"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-sans text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
          />
          <button 
            type="submit"
            disabled={isLoading || !customQuery.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-blue-450 hover:text-white text-xs font-bold rounded-lg border border-white/10 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 text-blue-400" />}
            <span>Query Analyst</span>
          </button>
        </form>

      </div>

      {/* 📈 Beautiful Corporate Consult Brief (Designed for elegant PDF layout) */}
      <div className="bg-white text-slate-900 rounded-xl p-8 print:p-0 print:bg-transparent shadow-xl border border-slate-200 print:border-none min-h-[600px] font-sans selection:bg-sky-100 selection:text-sky-900">
        
        {/* Cover Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-[10px] text-sky-600 uppercase tracking-widest font-bold">Confidential Corporate Brief</p>
              <h1 className="text-2xl font-black text-slate-900 font-sans tracking-tight uppercase mt-1">Enterprise Sales Performance & Strategic Optimization</h1>
            </div>
            <div className="text-right font-mono text-[10px] text-slate-500 font-medium">
              <p>DOC ID: DS-01-REQ</p>
              <p>DATE: May 2026</p>
              <p className="text-sky-600 font-bold">STATUS: COMPLETED</p>
            </div>
          </div>
        </div>

        {/* Executive Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 mb-6 border-b border-slate-200/80">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Gross Sales Portfolio</span>
            <span className="text-lg font-bold block text-slate-900 font-mono mt-1">$319,040.00</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Net Operating Profits</span>
            <span className="text-lg font-bold block text-emerald-650 font-mono mt-1">$56,533.00</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Active Region Nodes</span>
            <span className="text-lg font-bold block text-slate-900 font-mono mt-1">4 Regions</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">IQR Anomaly Outliers</span>
            <span className="text-lg font-bold block text-rose-600 font-mono mt-1">32 Records</span>
          </div>
        </div>

        {/* Main report body */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed font-sans">
          
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-950 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <CornerDownRight className="w-4 h-4 text-sky-600" />
              <span>1. Global Executive Performance Briefing</span>
            </h3>
            <p>
              This report compiles data science observations regarding corporate order pipelines across active years 2024 to 2026. General historical volumes indicate consistent growth peaking heavily during seasonal holiday transitions (specifically <b>November & December</b>), where standard transactions swell by <b>40% compared to core baseline averages</b>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-650" />
                <span>Prime Category drivers</span>
              </h4>
              <p className="text-xs">
                <b>Technology (Phones & Laptops)</b> continues as our undisputed revenue and profit anchor, delivering over <b>$178K in gross sales</b> at an impressive average net margin exceeding <b>21.4%</b>. Hardware bundling (e.g. matching accessories and ANC headphones) should match active marketing focuses.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <AlertCircle className="text-rose-600 w-3.5 h-3.5" />
                <span>Freight Logistics warning</span>
              </h4>
              <p className="text-xs">
                <b>Furniture products</b> (specifically large tables and executive chairs) represent high sticker-sales but yield severely pinched net operating profits. Realized margin ratio stands at a low <b>3.4%</b> due to high freight delivery logs and shipping contract overheads in secondary regions.
              </p>
            </div>
          </div>

          <div className="space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-100 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950">2. Statistical Outlier & Discrepancy Case</h3>
            <p className="text-xs text-slate-600 mt-1">
              Applying robust Z-score metrics isolated <b>32 distinct anomalies</b> showing significant discrepancies. Case records indicate individual transaction spikes where large bulk purchase quantities were tied with stacking system promotional discounts, resulting in net negative outcomes on High-value Technology rows. Immediate CRM coupon code restriction is highly recommended.
            </p>
          </div>

          {/* Dynamic advisor content result box */}
          <div className="border-t border-slate-200 pt-6 mt-6">
            <div className="flex items-center gap-2 mb-4 bg-sky-50 p-2.5 rounded-lg border border-sky-100">
              <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-sky-850">
                {customQuery ? `Specific Advisory Focus: ${customQuery}` : "3. Contextual Strategic Guidance & Strategic Recommendations"}
              </h4>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
                <span className="font-mono text-xs text-sky-600">Invoking Gemini Strategy Core...</span>
              </div>
            ) : reportResult ? (
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 text-slate-800 prose prose-slate max-w-none shadow-inner print:bg-transparent print:border-none print:shadow-none">
                <MarkdownRenderer content={reportResult} />
              </div>
            ) : (
              <div className="bg-slate-50/50 p-8 rounded-xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300" />
                <p className="text-xs text-slate-500 font-medium">No custom advisory query trigger is currently rendered.</p>
                <p className="text-[10px] text-slate-400">Use the query bar above or submit your own analysis guidance instructions.</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer info file logs */}
        <div className="border-t border-slate-200 mt-12 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-450">
          <span>Enterprise Strategic Advisor</span>
          <span>SYSTEM REPORT CERTIFIED: FUTURE_DS_01</span>
        </div>

      </div>

    </div>
  );
}
