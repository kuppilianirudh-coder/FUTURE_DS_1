/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Folder, 
  FileText, 
  GitCommit, 
  GitBranch, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Github, 
  Star, 
  Eye, 
  GitFork,
  BookOpen
} from 'lucide-react';

interface RepoFile {
  name: string;
  type: 'file' | 'folder';
  size: string;
  comment: string;
  content: string;
}

const REPO_FILES: RepoFile[] = [
  {
    name: 'README.md',
    type: 'file',
    size: '4.8 KB',
    comment: 'docs: update statistical findings and setup instructions',
    content: `# Business Sales Performance Analytics 📊
Enterprise analytics & data science solutions workspace repository.

**Repository Name:** \`FUTURE_DS_01\`

## 📊 Business Analysis Findings
- **High Profit Drivers:** Technology products (Laptops and ANC headphones) are the core profit anchors, contributing over **$178K** in revenue with average net margins &gt;21.4%.
- **Low Performing Sectors:** Furniture products are bulk volume items but suffer margins below **3.4%** due to high regional delivery logs.
- **Anomalous Spikes:** Isolated **32 anomalies** via IQR standard deviations. Analyses indicate stackable discount codes resulting in large orders with high losses.

## ⚙️ Installation & Sourcing
Install all dependencies for Python data analysis:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

To execute the data cleaning pipeline:
\`\`\`bash
python main_pipeline.py
\`\`\`

To explore the findings interactively:
\`\`\`bash
jupyter notebook FUTURE_DS_01_sales_performance_eda.ipynb
\`\`\``
  },
  {
    name: 'requirements.txt',
    type: 'file',
    size: '124 Bytes',
    comment: 'deps: pin analytics packages standards',
    content: `numpy>=1.22.0
pandas>=1.4.0
matplotlib>=3.5.0
seaborn>=0.11.0
scikit-learn>=1.0.0`
  },
  {
    name: 'main_pipeline.py',
    type: 'file',
    size: '1.2 KB',
    comment: 'feat: add outlier outlier tracking via isolation standard',
    content: `import pandas as pd
import numpy as np

def run_analytical_pipeline():
    """Reads corporate database logs and normalizes columns."""
    print("Initializing corporate compilation unit...")
    df = pd.read_csv("FUTURE_DS_01_sales_performance.csv")
    
    # Clean and Standardize headers
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    df['order_date'] = pd.to_datetime(df['order_date'])
    
    # Isolate anomalies via IQR
    q1 = df['profit'].quantile(0.25)
    q3 = df['profit'].quantile(0.75)
    iqr = q3 - q1
    df['outlier'] = (df['profit'] < q1 - 1.5*iqr) | (df['profit'] > q3 + 1.5*iqr)
    
    print(f"File loaded successfully. Data dimensions: {df.shape}")
    print(f"Total isolated outliers: {df['outlier'].sum()}")

if __name__ == '__main__':
    run_analytical_pipeline()`
  },
  {
    name: 'FUTURE_DS_01_sales_performance_eda.ipynb',
    type: 'file',
    size: '18.4 KB',
    comment: 'docs: add exploratory data analysis markdown cells',
    content: `{"cells": [ {"cell_type": "markdown", "source": ["# Sales EDA Notebook"]} ]}`
  },
  {
    name: 'FUTURE_DS_01_sales_performance.csv',
    type: 'file',
    size: '162 KB',
    comment: 'data: generate reproducible synthetic sales database',
    content: `Order ID,Order Date,Product Name,Category,Sub-Category,Sales,Profit,Quantity,Region,Customer Name,Segment\nORD-2024-10000,2024-01-03,Sony WH-1000XM5 ANC,Technology,Accessories,412.30,110.12,2,West,Arthur Dent,Consumer`
  }
];

interface GithubTabProps {
  onDownloadCSV: () => void;
}

export default function GithubTab({ onDownloadCSV }: GithubTabProps) {
  const [selectedFile, setSelectedFile] = useState<RepoFile>(REPO_FILES[0]);
  const [isCopied, setIsCopied] = useState(false);

  const copyContent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadFile = () => {
    if (selectedFile.name === 'FUTURE_DS_01_sales_performance.csv') {
      onDownloadCSV();
      return;
    }
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* 🐙 GitHub Repo header card */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 text-slate-300 rounded-lg border border-white/10">
            <Github className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-semibold text-sm hover:underline cursor-pointer">enterprise-analytics</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-100 font-bold text-sm hover:underline cursor-pointer">FUTURE_DS_01</span>
              <span className="text-[10px] bg-white/10 text-slate-350 border border-white/10 px-2 py-0.5 rounded-full font-medium">Public</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Professional corporate business sales performance analytics and ML workflow pipeline.</p>
          </div>
        </div>

        {/* GitHub stats widgets */}
        <div className="flex gap-2 text-xs font-mono">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <span className="px-2.5 py-1.5 flex items-center gap-1 hover:bg-white/10 cursor-pointer text-slate-200">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Star
            </span>
            <span className="px-2.5 py-1.5 bg-black/30 text-slate-400 border-l border-white/10 font-bold">18</span>
          </div>

          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <span className="px-2.5 py-1.5 flex items-center gap-1 hover:bg-white/10 cursor-pointer text-slate-200">
              <GitFork className="w-3.5 h-3.5" /> Fork
            </span>
            <span className="px-2.5 py-1.5 bg-black/30 text-slate-400 border-l border-white/10 font-bold">4</span>
          </div>
        </div>
      </div>

      {/* Main Repo columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* Left Side: Repo File List */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-slate-200">Files Matrix</span>
            <div className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-slate-300">main</span>
            </div>
          </div>

          {/* Core file rows */}
          <div className="divide-y divide-white/5 bg-transparent">
            {REPO_FILES.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFile(file)}
                className={`w-full flex items-center justify-between p-3.5 text-xs transition-colors hover:bg-white/10 text-left cursor-pointer ${selectedFile.name === file.name ? 'bg-white/10' : ''}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className={`w-4 h-4 shrink-0 ${file.name.endsWith('.py') ? 'text-emerald-400' : file.name.endsWith('.ipynb') ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className={`font-semibold truncate ${selectedFile.name === file.name ? 'text-blue-400' : 'text-slate-200'}`}>{file.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 max-w-[120px] truncate">{file.size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Selective File preview */}
        <div className="lg:col-span-2 flex flex-col bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-h-[400px]">
          
          <div className="bg-white/5 p-3 px-4 border-b border-white/10 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-200 text-xs">{selectedFile.name} (Preview Mode)</span>
            <div className="flex gap-2">
              <button 
                onClick={copyContent}
                className="p-1.5 py-2 px-3 text-xs text-slate-350 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>

              <button 
                onClick={downloadFile}
                className="p-1.5 py-2 px-3 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg border border-white/10 transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                <span>Raw</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-5 font-mono text-xs text-slate-350 overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-[480px] bg-black/10 select-text selection:bg-blue-600/30 selection:text-white">
            {selectedFile.content}
          </div>

        </div>

      </div>

    </div>
  );
}
