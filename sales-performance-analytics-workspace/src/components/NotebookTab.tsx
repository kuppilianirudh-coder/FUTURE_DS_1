/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { NotebookCell, JUPYTER_CELLS } from '../notebookData.js';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  BookOpen, 
  Terminal, 
  Download,
  AlertCircle,
  FileCode,
  Check
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer.js';

interface NotebookTabProps {
  onDownloadCSV: () => void;
}

export default function NotebookTab({ onDownloadCSV }: NotebookTabProps) {
  const [cells, setCells] = useState<NotebookCell[]>(JUPYTER_CELLS);
  const [runningCellId, setRunningCellId] = useState<string | null>(null);
  const [completedCells, setCompletedCells] = useState<Record<string, boolean>>({
    '2': false,
    '4': false,
    '6': false,
    '8': false,
    '10': false
  });
  const [isCompilingAll, setIsCompilingAll] = useState(false);

  // Trigger individual simulated python cell run
  const runCell = (cellId: string) => {
    const targetCell = cells.find(c => c.id === cellId);
    if (!targetCell || targetCell.type === 'markdown') return;

    setRunningCellId(cellId);
    setCompletedCells(prev => ({ ...prev, [cellId]: false }));

    setTimeout(() => {
      setRunningCellId(null);
      setCompletedCells(prev => ({ ...prev, [cellId]: true }));
    }, targetCell.durationMs || 400);
  };

  // Compile entire Jupyter notebook step by step
  const runAllCells = async () => {
    setIsCompilingAll(true);
    // Reset status first
    setCompletedCells({
      '2': false,
      '4': false,
      '6': false,
      '8': false,
      '10': false
    });

    const codeCells = cells.filter(c => c.type === 'code');
    for (const codeCell of codeCells) {
      setRunningCellId(codeCell.id);
      await new Promise(resolve => setTimeout(resolve, codeCell.durationMs || 500));
      setCompletedCells(prev => ({ ...prev, [codeCell.id]: true }));
    }
    setRunningCellId(null);
    setIsCompilingAll(false);
  };

  const resetNotebook = () => {
    setCompletedCells({
      '2': false,
      '4': false,
      '6': false,
      '8': false,
      '10': false
    });
    setRunningCellId(null);
    setIsCompilingAll(false);
  };

  // Generate ipynb download mock package
  const triggerDownloadNotebook = () => {
    const notebookJson = {
      cells: cells.map(c => ({
        cell_type: c.type,
        metadata: {},
        source: c.content.split('\n'),
        outputs: c.output ? [{
          output_type: "stream",
          name: "stdout",
          text: typeof c.output.data === 'string' ? [c.output.data] : [JSON.stringify(c.output.data)]
        }] : []
      })),
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3"
        }
      },
      nbformat: 4,
      nbformat_minor: 2
    };

    const blob = new Blob([JSON.stringify(notebookJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'FUTURE_DS_01_sales_performance_eda.ipynb';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerDownloadRequirements = () => {
    const reqs = `numpy>=1.22.0\npandas>=1.4.0\nmatplotlib>=3.5.0\nseaborn>=0.11.0\nscikit-learn>=1.0.0`;
    const blob = new Blob([reqs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'requirements.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* 📓 Interactive Notebook Header */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/30">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Interactive Jupyter Workspace</h2>
              <p className="font-mono text-[10px] text-slate-400">FILE: FUTURE_DS_01_sales_performance_eda.ipynb</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={runAllCells}
              disabled={isCompilingAll || runningCellId !== null}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Compile Notebook (Run All)</span>
            </button>

            <button 
              onClick={resetNotebook}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition border border-white/10 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>

            <button 
              onClick={triggerDownloadNotebook}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300 text-xs font-semibold rounded-lg transition border border-white/10 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ipynb Notebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📓 Display Cells Flow */}
      <div className="space-y-4">
        {cells.map((cell, index) => {
          const isCode = cell.type === 'code';
          const isRunning = runningCellId === cell.id;
          const isCompleted = completedCells[cell.id];

          return (
            <div key={cell.id} className="group flex flex-col md:flex-row gap-2">
              
              {/* Left sidebar info: execution counter indices */}
              <div className="w-16 md:w-20 shrink-0 flex md:justify-end pr-2 pt-2.5 select-none font-mono text-[11px] text-slate-500">
                {isCode ? (
                  isRunning ? (
                    <span className="text-blue-400 animate-pulse">In [*]:</span>
                  ) : isCompleted ? (
                    <span className="text-emerald-400">In [{index + 1}]:</span>
                  ) : (
                    <span>In [ ]:</span>
                  )
                ) : (
                  <span className="text-slate-600">Markdown</span>
                )}
              </div>

              {/* Main cell block body */}
              <div className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all group-hover:border-white/20">
                
                {/* 📝 Markdown Renderer View */}
                {!isCode ? (
                  <div className="p-5 text-slate-200 max-w-none hover:bg-white/5 transition select-text select-all">
                    <MarkdownRenderer content={cell.content} />
                  </div>
                ) : (
                  /* 💻 Code Block Input View */
                  <div className="flex flex-col">
                    {/* Header bar of Code Block */}
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-blue-400" />
                        <span>Python Code Cell</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="text-emerald-400 flex items-center gap-1 text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <Check className="w-2.5 h-2.5" /> Executed
                          </span>
                        )}
                        <button 
                          onClick={() => runCell(cell.id)}
                          disabled={isRunning || isCompilingAll}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-blue-400 hover:text-blue-300 rounded border border-white/5 text-[9px] cursor-pointer"
                        >
                          Execute Cell
                        </button>
                      </div>
                    </div>

                    {/* Pre-formatted source block */}
                    <div className="p-4 bg-black/40 font-mono text-xs text-slate-300 overflow-x-auto select-all leading-relaxed whitespace-pre selection:bg-white/10 border-b border-white/5">
                      {cell.content}
                    </div>

                    {/* 📦 Compiled Output Boxes (if executed / run completed) */}
                    {(isRunning || isCompleted) && cell.output && (
                      <div className="bg-white/5 p-5 border-t border-white/10 animate-fade-in">
                        <p className="text-[10px] font-mono text-slate-500 mb-2 select-none">Output Logs:</p>

                        {/* Loading pulse */}
                        {isRunning && (
                          <div className="flex items-center gap-2 font-mono text-xs text-slate-400 py-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                            <span>Crunching statistics in active memory...</span>
                          </div>
                        )}

                        {/* Render table output */}
                        {isCompleted && cell.output.type === 'table' && (
                          <div className="space-y-3">
                            <div className="overflow-x-auto border border-white/10 rounded-xl">
                              <table className="w-full text-left font-mono text-[11px] text-slate-300 border-collapse">
                                <thead className="bg-white/5 text-slate-350 border-b border-white/10">
                                  <tr>
                                    {cell.output.data.headers.map((h: string, idx: number) => (
                                      <th key={idx} className="p-2 py-2.5">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-black/10 text-slate-300">
                                  {cell.output.data.rows.map((row: any[], rowIdx: number) => (
                                    <tr key={rowIdx} className="hover:bg-white/5">
                                      {row.map((val, colIdx) => (
                                        <td key={colIdx} className="p-2">{val}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 italic">DataFrame status: {cell.output.data.summary}</p>
                          </div>
                        )}

                        {/* Render standard text output */}
                        {isCompleted && cell.output.type === 'text' && (
                          <pre className="font-mono text-xs text-emerald-400/95 leading-relaxed whitespace-pre select-text">
                            {cell.output.data}
                          </pre>
                        )}

                        {/* Render high profit metrics output */}
                        {isCompleted && cell.output.type === 'metrics' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {cell.output.data.map((m: any, idx: number) => (
                              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 shadow">
                                <span className="text-[10px] font-mono text-blue-400 tracking-widest uppercase block mb-1">{m.label} Sector</span>
                                <div className="flex justify-between items-baseline mt-1.5">
                                  <span className="text-sm font-bold font-mono text-slate-100">{m.sales}</span>
                                  <span className="text-[11px] font-mono text-emerald-400">Margin: {m.margin}</span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 mt-1">Cumulate Net Profit: {m.profit}</div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

      {/* 📁 Supplementary Asset Deck Download Command */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl text-center space-y-4">
        <h3 className="font-bold text-slate-100 text-sm tracking-wide">Ready for Production Deployment?</h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Download the raw python code assets, setup configurations, and synthetic sales databases to showcase or publish in your personal portfolio folders.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button 
            onClick={triggerDownloadRequirements}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition border border-white/10 cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Save requirements.txt</span>
          </button>
          
          <button 
            onClick={onDownloadCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition border border-white/10 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Save Dataset (.csv)</span>
          </button>
        </div>
      </div>

    </div>
  );
}
