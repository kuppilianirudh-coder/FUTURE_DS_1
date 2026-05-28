/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Terminal, 
  Settings2, 
  Play, 
  AlertOctagon, 
  Monitor, 
  Copy, 
  Check, 
  RotateCw 
} from 'lucide-react';

export default function CompilerTab() {
  const [size, setSize] = useState<number>(1000);
  const [anomalyMode, setAnomalyMode] = useState<'low' | 'medium' | 'severe'>('medium');
  const [seedVal, setSeedVal] = useState<number>(54321);

  const [isRunning, setIsRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Trigger Python executable script simulation
  const runSimulationCode = () => {
    setIsRunning(true);
    setTerminalLogs([]);

    const logSteps = [
      `$ python main_pipeline.py --size=${size} --anomaly=${anomalyMode} --seed=${seedVal}`,
      `[sys] Loading Python environment...`,
      `[sys] Core libraries: numpy v1.26.1, pandas v2.2.0, scikit-learn v1.4.1`,
      `[data] Executing deterministic pseudo-random sales gen pipeline...`,
      `[data] SUCCESSFULLY generated ${size} synthetic records with Seed ${seedVal}`,
      `[clean] Normalizing schema structure: Converting column names to neat snake_case`,
      `[clean] Formatted 'order_date' indices as standard pandas Datetime timestamp Series`,
      `[clean] Scanned 0 null elements. Imputing system gaps: None required.`,
      `[outlier] Evaluating Outlier Boundaries on Revenue & Profit indexes using IQR...`,
      `[outliers] Standard limit thresholds based on IQR * 1.5 standard deviation limits:`,
      `           > Profit Outlier Limit Upper: $101.00`,
      `           > Profit Outlier Limit Lower: -$40.60`,
      `[outliers] Detected ${anomalyMode === 'low' ? '12' : anomalyMode === 'medium' ? '32' : '65'} total transaction outliers under current criteria.`,
      `[outliers] Isolation forest & Z-score evaluation triggered dynamically.`,
      `[model] Fitting ordinary least-squares linear series to monthly sales projections...`,
      `[output] Serializing processed sales dataframe array to disk: 'FUTURE_DS_01_sales_performance.csv'`,
      `[output] EXPORT SUCCESS! CSV file written. Size: ${(size * 180 / 1024).toFixed(1)} KB`,
      `[sys] Total execution pipeline finished in 1.48s. Code output: 0 (SUCCESS).`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setTerminalLogs(prev => [...prev, logSteps[currentStep]]);
      currentStep++;
      if (currentStep >= logSteps.length) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 150);
  };

  const copyCorePythonScript = () => {
    const pythonCode = `import pandas as pd
import numpy as np

def clean_and_impute_dataset(filepath="FUTURE_DS_01_sales_performance.csv"):
    """
    Standardizes column schemas and isolates anomalies using IQR.
    """
    print("[1/4] Reading sales transactional file...")
    df = pd.read_csv(filepath)
    
    # Standardize header casing
    df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('-', '_')
    df['order_date'] = pd.to_datetime(df['order_date'])
    
    print(f"[2/4] Shape: {df.shape[0]} rows loaded successfully.")
    
    # Calculate Profit Margin
    df['margin'] = df['profit'] / df['sales']
    
    # Outlier Detection
    q1 = df['profit'].quantile(0.25)
    q3 = df['profit'].quantile(0.75)
    iqr = q3 - q1
    lower_limit = q1 - 1.5 * iqr
    upper_limit = q3 + 1.5 * iqr
    
    anomalies = df[(df['profit'] < lower_limit) | (df['profit'] > upper_limit)]
    print(f"[3/4] Isolated {len(anomalies)} statistical anomalies beyond range [{lower_limit:.2f}, {upper_limit:.2f}]")
    
    # Summarize top performers
    best_performers = df.groupby('category')['profit'].sum().sort_values(ascending=False)
    print("\\n[4/4] Summary Profit matrix by Category:")
    print(best_performers.to_string())
    
    return df

if __name__ == "__main__":
    clean_and_impute_dataset()`;

    navigator.clipboard.writeText(pythonCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left side: Parameter controls */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-xl space-y-5">
        
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Settings2 className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-widest">Compiler Parameters</h3>
        </div>

        <div className="space-y-4">
          
          {/* Dataset Size slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Dataset Records Size</span>
              <span className="font-mono text-blue-400 font-bold">{size} items</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="5000" 
              step="100"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-lg bg-white/10 accent-blue-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 font-mono">Modifies total rows in core pandas matrix.</p>
          </div>

          {/* Anomaly Mode */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium block">Injected Outlier Density</span>
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-1.5 rounded-lg border border-white/10">
              <button 
                onClick={() => setAnomalyMode('low')}
                className={`py-1 rounded text-xs transition cursor-pointer font-mono ${anomalyMode === 'low' ? 'bg-blue-600/30 text-white font-bold border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                LOW
              </button>
              <button 
                onClick={() => setAnomalyMode('medium')}
                className={`py-1 rounded text-xs transition cursor-pointer font-mono ${anomalyMode === 'medium' ? 'bg-blue-600/30 text-white font-bold border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                MID
              </button>
              <button 
                onClick={() => setAnomalyMode('severe')}
                className={`py-1 rounded text-xs transition cursor-pointer font-mono ${anomalyMode === 'severe' ? 'bg-blue-600/30 text-white font-bold border border-blue-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                SEVERE
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Triggers extreme frequency profit loss logs.</p>
          </div>

          {/* Random Seed */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium block">PRNG Seed Key</span>
            <input 
              type="number"
              value={seedVal}
              onChange={(e) => setSeedVal(parseInt(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/40"
            />
            <p className="text-[10px] text-slate-500 font-mono">Secures mathematical reproducibility for validations.</p>
          </div>

          <button 
            onClick={runSimulationCode}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition shadow-md shadow-blue-500/15 cursor-pointer"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>CLEANING DATASET...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>COMPILE PYTHON PIPELINE</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Right side 2 columns: Execution terminal stdout */}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        
        {/* Actual terminal stdout container */}
        <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[380px]">
          
          <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">Terminal Shell: core_compilation_unit</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></span>
            </div>
          </div>

          <div className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 max-h-[420px] scrollbar-thin scrollbar-thumb-white/10 bg-black/5">
            {terminalLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1 py-12">
                <Terminal className="w-10 h-10 text-slate-600 animate-pulse" />
                <span>Compiler idle. Tap parameter run command on the left block.</span>
              </div>
            ) : (
              terminalLogs.map((log, index) => {
                let color = 'text-slate-350';
                if (log.startsWith('$')) {
                  color = 'text-blue-400 font-bold';
                } else if (log.includes('[sys]')) {
                  color = 'text-slate-500';
                } else if (log.includes('[OK]')) {
                  color = 'text-emerald-400 font-semibold';
                } else if (log.includes('[clean]')) {
                  color = 'text-sky-400/90';
                } else if (log.includes('[outliers]')) {
                  color = 'text-amber-400';
                } else if (log.includes('[model]')) {
                  color = 'text-violet-400';
                } else if (log.includes('SUCCESS')) {
                  color = 'text-emerald-400 font-bold';
                }

                return (
                  <div key={index} className={`${color} leading-relaxed font-mono whitespace-pre-wrap`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Underlying code snippet view */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2">
            <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest font-mono">Source python snippet \`clean_pipe.py\`</h4>
            <button 
              onClick={copyCorePythonScript}
              className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-250 text-[10px] font-mono rounded transition border border-white/10 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Script!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[10px] font-mono text-slate-500 overflow-x-auto select-all leading-normal max-h-36">
{`def clean_and_impute_dataset(filepath="FUTURE_DS_01_sales_performance.csv"):
    df = pd.read_csv(filepath)
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    df['order_date'] = pd.to_datetime(df['order_date'])
    df['margin'] = df['profit'] / df['sales']
    # IQR outliers filtering
    q1, q3 = df['profit'].quantile([0.25, 0.75])
    iqr = q3 - q1
    df_clean = df[(df['profit'] >= q1 - 1.5*iqr) & (df['profit'] <= q3 + 1.5*iqr)]
    return df_clean`}
          </pre>
        </div>

      </div>

    </div>
  );
}
