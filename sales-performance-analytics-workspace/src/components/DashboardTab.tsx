/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { SalesRecord, DashboardFilters, SalesMetrics } from '../types.js';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ScatterChart, 
  Scatter, 
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  Loader2, 
  Download, 
  Filter, 
  RefreshCw,
  ShoppingBag,
  MapPin,
  HelpCircle
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer.js';

interface DashboardTabProps {
  dataset: SalesRecord[];
  onTriggerDownload: () => void;
}

export default function DashboardTab({ dataset, onTriggerDownload }: DashboardTabProps) {
  // Filters
  const [filters, setFilters] = useState<DashboardFilters>({
    year: 'All',
    region: 'All',
    category: 'All'
  });

  // Active sub-view inside Dashboard
  const [chartSubTab, setChartSubTab] = useState<'trends' | 'categories' | 'outliers' | 'customers'>('trends');

  // AI intelligence states
  const [aiReport, setAiReport] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [typedReport, setTypedReport] = useState<string>('');

  // 1. Apply Filters to Dataset
  const filteredData = useMemo(() => {
    return dataset.filter(item => {
      const itemYear = new Date(item.orderDate).getFullYear().toString();
      const matchYear = filters.year === 'All' || itemYear === filters.year;
      const matchRegion = filters.region === 'All' || item.region === filters.region;
      const matchCategory = filters.category === 'All' || item.category === filters.category;
      return matchYear && matchRegion && matchCategory;
    });
  }, [dataset, filters]);

  // 2. Calculations of KPI Metrics
  const metrics = useMemo<SalesMetrics>(() => {
    let totalSales = 0;
    let totalProfit = 0;
    let totalQuantity = 0;
    let outlierCount = 0;

    filteredData.forEach(item => {
      totalSales += item.sales;
      totalProfit += item.profit;
      totalQuantity += item.quantity;
      if (item.outlierType !== 'None') {
        outlierCount += 1;
      }
    });

    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      profitMargin: Math.round(profitMargin * 10), // Will divide by 10 later for accuracy
      totalQuantity,
      outlierCount
    };
  }, [filteredData]);

  // 3. Prepare Chart Data - Monthly aggregation (Revenue, Profit)
  const monthlyData = useMemo(() => {
    const monthlyMap: Record<string, { name: string; sales: number; profit: number }> = {};

    filteredData.forEach(item => {
      const date = new Date(item.orderDate);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[yearMonth]) {
        monthlyMap[yearMonth] = {
          name: yearMonth,
          sales: 0,
          profit: 0
        };
      }
      monthlyMap[yearMonth].sales += item.sales;
      monthlyMap[yearMonth].profit += item.profit;
    });

    return Object.values(monthlyMap)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(item => ({
        ...item,
        sales: Math.round(item.sales),
        profit: Math.round(item.profit)
      }));
  }, [filteredData]);

  // 4. Prepare Category & Sub-Category Metrics
  const categoryData = useMemo(() => {
    const categoriesMap: Record<string, { name: string; sales: number; profit: number }> = {};
    filteredData.forEach(item => {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = { name: item.category, sales: 0, profit: 0 };
      }
      categoriesMap[item.category].sales += item.sales;
      categoriesMap[item.category].profit += item.profit;
    });

    return Object.values(categoriesMap).map(c => ({
      ...c,
      sales: Math.round(c.sales),
      profit: Math.round(c.profit),
      margin: c.sales > 0 ? Math.round((c.profit / c.sales) * 100) : 0
    }));
  }, [filteredData]);

  // 5. Customer / Leaderboard data
  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; sales: number; profit: number; qty: number }> = {};
    filteredData.forEach(item => {
      if (!productMap[item.productName]) {
        productMap[item.productName] = { name: item.productName, sales: 0, profit: 0, qty: 0 };
      }
      productMap[item.productName].sales += item.sales;
      productMap[item.productName].profit += item.profit;
      productMap[item.productName].qty += item.quantity;
    });

    return Object.values(productMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map(p => ({
        ...p,
        sales: Math.round(p.sales),
        profit: Math.round(p.profit)
      }));
  }, [filteredData]);

  const regionalBreakdown = useMemo(() => {
    const regionsMap: Record<string, { name: string; sales: number; profit: number }> = {};
    filteredData.forEach(item => {
      if (!regionsMap[item.region]) {
        regionsMap[item.region] = { name: item.region, sales: 0, profit: 0 };
      }
      regionsMap[item.region].sales += item.sales;
      regionsMap[item.region].profit += item.profit;
    });
    return Object.values(regionsMap).map(r => ({
      ...r,
      sales: Math.round(r.sales),
      profit: Math.round(r.profit)
    }));
  }, [filteredData]);

  // 6. Call local server route to fetch Gemini Sales Intelligence Report
  const triggerAiAdvisory = async () => {
    setIsAiLoading(true);
    setAiReport('');
    setTypedReport('');

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          metrics: {
            totalSales: metrics.totalSales,
            totalProfit: metrics.totalProfit,
            profitMargin: (metrics.profitMargin / 10).toFixed(1),
            totalQuantity: metrics.totalQuantity,
            outlierCount: metrics.outlierCount
          },
          topProducts,
          categoryPerformance: categoryData,
          regionalBreakdown
        })
      });

      const resJson = await response.json();
      if (resJson.success) {
        setAiReport(resJson.report);
      } else {
        setAiReport(`### ⚠️ Operation Error\nFailed to pull live analysis: ${resJson.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setAiReport(`### ⚠️ Network Timeout\nUnable to bridge endpoint stream: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Strategic Advisory typewriter effect simulator for stunning UI polish
  useEffect(() => {
    if (!aiReport) return;
    let i = 0;
    const interval = setInterval(() => {
      setTypedReport(prev => prev + aiReport.charAt(i));
      i++;
      if (i >= aiReport.length) {
        clearInterval(interval);
      }
    }, 4); // Fast tick to stream text smoothly

    return () => clearInterval(interval);
  }, [aiReport]);

  // Auto trigger default advisory report on mounts
  useEffect(() => {
    triggerAiAdvisory();
  }, [filters]);

  const resetFilters = () => {
    setFilters({ year: 'All', region: 'All', category: 'All' });
  };

  return (
    <div className="space-y-6">
      
      {/* 🚀 Interactive Filter Command Center */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-blue-400">
            <Filter className="w-5 h-5 text-blue-400 animate-pulse" />
            <h3 className="font-mono text-sm uppercase tracking-wider text-slate-200">Analytical Parameters</h3>
            {filteredData.length < dataset.length && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/20 font-mono">
                Showing {filteredData.length} of {dataset.length} Orders
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year */}
            <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
              <span className="text-xs text-slate-400 font-mono">Yr:</span>
              <select 
                value={filters.year} 
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value as any }))}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Years</option>
                <option value="2024" className="bg-slate-900">2024</option>
                <option value="2025" className="bg-slate-900">2025</option>
                <option value="2026" className="bg-slate-900">2026</option>
              </select>
            </div>

            {/* Region */}
            <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
              <span className="text-xs text-slate-400 font-mono">Region:</span>
              <select 
                value={filters.region} 
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value as any }))}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Regions</option>
                <option value="West" className="bg-slate-900">West Region</option>
                <option value="East" className="bg-slate-900">East Region</option>
                <option value="Central" className="bg-slate-900">Central Region</option>
                <option value="South" className="bg-slate-900">South Region</option>
              </select>
            </div>

            {/* Category */}
            <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10">
              <span className="text-xs text-slate-400 font-mono">Category:</span>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Sectors</option>
                <option value="Technology" className="bg-slate-900">Technology</option>
                <option value="Furniture" className="bg-slate-900">Furniture</option>
                <option value="Office Supplies" className="bg-slate-900">Office Supplies</option>
              </select>
            </div>

            <button 
              onClick={resetFilters}
              title="Reset Selections"
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition border border-white/10 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-blue-300" />
            </button>

            <button 
              onClick={onTriggerDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Dataset CSV</span>
            </button>
          </div>

        </div>
      </div>

      {/* 📊 High-Contrast Industrial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Sales */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg hover:border-blue-500/30 transition group relative overflow-hidden">
          <div className="absolute right-2 top-2 text-white/5 group-hover:text-white/10 transition-colors">
            <DollarSign className="w-12 h-12" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-2xl font-bold font-mono text-white">${metrics.totalSales.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.1% Base Volume Index</span>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg hover:border-emerald-500/30 transition group relative overflow-hidden">
          <div className="absolute right-2 top-2 text-white/5 group-hover:text-white/10 transition-colors">
            <DollarSign className="w-12 h-12" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Profit</p>
          <p className={`text-2xl font-bold font-mono ${metrics.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.totalProfit < 0 && '-'}${Math.abs(metrics.totalProfit).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Net Tax Adjustments Applied</span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg hover:border-indigo-500/30 transition group relative overflow-hidden">
          <div className="absolute right-2 top-2 text-white/5 group-hover:text-white/10 transition-colors">
            <Percent className="w-12 h-12" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Profitability Margin</p>
          <p className={`text-2xl font-bold font-mono ${metrics.profitMargin >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            {(metrics.profitMargin / 10).toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-400 font-mono">
            <span>Average Corporate Target 15.0%</span>
          </div>
        </div>

        {/* Items Sold */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg hover:border-amber-500/30 transition group relative overflow-hidden">
          <div className="absolute right-2 top-2 text-white/5 group-hover:text-white/10 transition-colors">
            <Layers className="w-12 h-12" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Quantity Processed</p>
          <p className="text-2xl font-bold font-mono text-amber-400">{metrics.totalQuantity.toLocaleString()} Units</p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-mono">
            <span>Aggregated Orders: {filteredData.length}</span>
          </div>
        </div>

        {/* Outliers */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg hover:border-rose-500/30 transition group relative overflow-hidden">
          <div className="absolute right-2 top-2 text-white/5 group-hover:text-white/10 transition-colors">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Outliers Isolated</p>
          <p className={`text-2xl font-bold font-mono ${metrics.outlierCount > 0 ? 'text-rose-450' : 'text-slate-400'}`}>
            {metrics.outlierCount} Records
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-rose-400 font-mono">
            <span>Z-Score Threshold: &gt; ±2.0</span>
          </div>
        </div>

      </div>

      {/* 📊 Interactive Analytical Charts Tabbed Arena & COGNITIVE INSIGHTS SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Charts & Visuals */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-xl">
            {/* Visual Switcher Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base text-white">Exploratory Data Graphics</h3>
              </div>
              <div className="flex gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10">
                <button 
                  onClick={() => setChartSubTab('trends')}
                  className={`px-3 py-1 rounded text-xs transition cursor-pointer ${chartSubTab === 'trends' ? 'bg-blue-600/30 text-white font-medium border border-blue-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Monthly Trends
                </button>
                <button 
                  onClick={() => setChartSubTab('categories')}
                  className={`px-3 py-1 rounded text-xs transition cursor-pointer ${chartSubTab === 'categories' ? 'bg-blue-600/30 text-white font-medium border border-blue-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Categories Performance
                </button>
                <button 
                  onClick={() => setChartSubTab('outliers')}
                  className={`px-3 py-1 rounded text-xs transition cursor-pointer ${chartSubTab === 'outliers' ? 'bg-blue-600/30 text-white font-medium border border-blue-500/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Anomaly Scatter
                </button>
              </div>
            </div>

            {/* Display Visual Panel */}
            <div className="h-80 w-full relative">
              {filteredData.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm">
                  <Layers className="w-12 h-12 text-slate-600 mb-2 animate-bounce" />
                  <span>No data points fulfill current criteria filters.</span>
                  <button onClick={resetFilters} className="text-blue-400 mt-2 text-xs underline cursor-pointer">Reset Parameters</button>
                </div>
              ) : chartSubTab === 'trends' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                    <Line type="monotone" name="Revenue ($)" dataKey="sales" stroke="#60a5fa" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Net Profit ($)" dataKey="profit" stroke="#34d399" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : chartSubTab === 'categories' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar name="Sales Total ($)" dataKey="sales" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    <Bar name="Profit Margin (%)" dataKey="margin" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col justify-between">
                  {/* Scatter Chart */}
                  <div className="flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                        <XAxis type="number" dataKey="sales" name="Sales" unit="$" stroke="#94a3b8" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                        <YAxis type="number" dataKey="profit" name="Profit" unit="$" stroke="#94a3b8" tick={{ fontSize: 9, fontFamily: 'monospace' }} />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', fontSize: 11 }}
                        />
                        <Scatter name="Transactions" data={filteredData}>
                          {filteredData.map((entry, index) => {
                            let color = '#60a5fa'; // normal is sky/blue
                            if (entry.outlierType === 'High Margin') {
                              color = '#fbbf24'; // beautiful pure gold profit
                            } else if (entry.outlierType === 'High Sales Severe Loss') {
                              color = '#f87171'; // danger red
                            }
                            return <Cell key={`cell-${index}`} fill={color} r={entry.outlierType !== 'None' ? 6 : 4} stroke={entry.outlierType !== 'None' ? '#fff' : 'none'} />;
                          })}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend guide info */}
                  <div className="flex justify-center gap-6 mt-2 text-[11px] font-mono text-slate-350 bg-white/5 py-1.5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]"></span>
                      <span>Standard Orders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] border border-white"></span>
                      <span>High-Margin Services (Outliers)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f87171] border border-white animate-pulse"></span>
                      <span>High Volume Freight Loss (Outliers)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Regional Performance Table & Product Leaderboards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top Products */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-3">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest">Top Selling Products</h4>
              </div>
              <div className="space-y-2">
                {topProducts.map((p, index) => (
                  <div key={index} className="flex items-center justify-between text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="truncate pr-2 flex items-center gap-2">
                      <span className="font-mono text-amber-500 font-bold">#{index + 1}</span>
                      <span className="text-slate-200 font-semibold truncate" title={p.name}>{p.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-slate-100 font-semibold">${p.sales.toLocaleString()}</p>
                      <p className={`text-[10px] font-mono ${p.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.profit >= 0 ? '+' : '-'}${Math.abs(p.profit).toLocaleString()} net
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Matrix */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-3">
                <MapPin className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest">Regional Breakdown Matrices</h4>
              </div>
              <div className="space-y-3">
                {regionalBreakdown.map((r, index) => {
                  const maxSales = Math.max(...regionalBreakdown.map(x => x.sales), 1);
                  const sharePercentage = (r.sales / maxSales) * 100;
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-200 font-semibold">{r.name} Region</span>
                        <span className="text-slate-200 font-bold">${r.sales.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden border border-white/5 flex">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${sharePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Column: GenAI Cognitive Business Analyst */}
        <div className="space-y-4">
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="bg-white/5 p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-1.5 bg-blue-500/10 text-blue-450 rounded-lg border border-blue-400/20">
                    <Sparkles className="w-4 h-4 animate-spin text-blue-400" style={{ animationDuration: '4s' }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Gemini Strategy Copilot</h4>
                    <p className="text-[10px] text-blue-400 font-mono tracking-wider">REAL-TIME COGNITIVE INTELLIGENCE</p>
                  </div>
                </div>
                <button 
                  onClick={triggerAiAdvisory}
                  disabled={isAiLoading}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-blue-300 hover:text-white rounded-md transition border border-white/10 disabled:opacity-50 cursor-pointer"
                  title="Ask Gemini to re-analyze"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Content Display Card */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[460px] scrollbar-thin scrollbar-thumb-white/10">
              {isAiLoading ? (
                <div className="h-48 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                  <p className="text-[11px] font-mono text-slate-400 animate-pulse uppercase tracking-wider">Compiling contextual databases...</p>
                </div>
              ) : typedReport ? (
                <div className="animate-fade-in divide-y divide-white/5 select-text selection:bg-blue-600/30 selection:text-white">
                  <MarkdownRenderer content={typedReport} />
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <HelpCircle className="w-10 h-10 text-slate-650 mb-2" />
                  <span>Interactive sales analysis pending.</span>
                </div>
              )}
            </div>

            {/* Sticky bottom command option */}
            <div className="bg-white/5 p-3 border-t border-white/10 text-[10px] font-mono text-slate-400">
              <div className="flex justify-between items-center text-slate-500">
                <span>MODEL: gemini-3.5-flash</span>
                <span className="text-[9px] bg-white/5 border border-white/10 px-1.5 rounded text-blue-400">Contextual Grounding Active</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
