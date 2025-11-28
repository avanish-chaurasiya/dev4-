import React, { useState } from 'react';
import { analyzeJobOffer } from '../services/geminiService';
import { JobAnalysisResult } from '../types';
import { Card, Button, Badge } from './UI';
import { Check, X, AlertTriangle, BrainCircuit, Zap } from 'lucide-react';

export const JobModule: React.FC = () => {
  const [jobText, setJobText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobAnalysisResult | null>(null);
  const [deepThinking, setDeepThinking] = useState(false);

  const handleAnalyze = async () => {
    if (!jobText.trim()) return;
    setLoading(true);
    try {
      const analysis = await analyzeJobOffer(jobText, deepThinking);
      setResult(analysis);
    } catch (e) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold text-white mb-2">Job & Internship Vetting</h2>
            <p className="text-slate-400">Detect recruitment scams and verify company legitimacy.</p>
         </div>
         <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
             <button 
                onClick={() => setDeepThinking(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${!deepThinking ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                <Zap className="w-4 h-4" />
                Fast Check
             </button>
             <button 
                onClick={() => setDeepThinking(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${deepThinking ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                <BrainCircuit className="w-4 h-4" />
                Deep Thinking
             </button>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 h-full flex flex-col">
               <h3 className="font-semibold text-white mb-4">Job Offer Details</h3>
               <textarea 
                 className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[300px]"
                 placeholder="Paste the full job description, email content, or message here..."
                 value={jobText}
                 onChange={(e) => setJobText(e.target.value)}
               />
               <div className="mt-4 pt-4 border-t border-slate-800">
                 <Button onClick={handleAnalyze} isLoading={loading} className="w-full">
                    {deepThinking ? 'Deep Investigation' : 'Verify Offer'}
                 </Button>
               </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!result ? (
                <div className="h-full bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <FileSearchIcon />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">Ready to Review</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        {deepThinking 
                          ? "Using Gemini 3 Pro with high thinking budget for complex pattern matching." 
                          : "Using Gemini Flash with Google Search grounding for real-time verification."}
                    </p>
                </div>
            ) : (
                <div className="space-y-6 animate-slide-up">
                    <Card className={`p-6 border-t-4 ${
                        result.verdict === 'LEGITIMATE' ? 'border-t-emerald-500' :
                        result.verdict === 'SUSPICIOUS' ? 'border-t-amber-500' : 'border-t-rose-500'
                    }`}>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {result.verdict === 'LEGITIMATE' ? 'Likely Legitimate' :
                                     result.verdict === 'SUSPICIOUS' ? 'Exercise Caution' : 'Potential Scam Detected'}
                                </h2>
                                <p className="text-slate-400 text-sm">Based on {deepThinking ? 'deep semantic analysis' : 'company verification & pattern matching'}</p>
                            </div>
                            <Badge color={
                                result.verdict === 'LEGITIMATE' ? 'green' :
                                result.verdict === 'SUSPICIOUS' ? 'yellow' : 'red'
                            }>
                                {result.verdict}
                            </Badge>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wide mb-2">Company Status</h4>
                                <p className="text-slate-300">{result.companyStatus}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="flex items-center gap-2 font-medium text-emerald-400 mb-3">
                                        <Check className="w-4 h-4" /> Evidence
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.evidence.map((item, i) => (
                                            <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 shrink-0"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="flex items-center gap-2 font-medium text-rose-400 mb-3">
                                        <AlertTriangle className="w-4 h-4" /> Red Flags
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.redFlags.length > 0 ? result.redFlags.map((item, i) => (
                                            <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-rose-900 rounded-full mt-1.5 shrink-0"></span>
                                                {item}
                                            </li>
                                        )) : (
                                            <li className="text-sm text-slate-500 italic">No major red flags detected.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
          </div>
       </div>
    </div>
  );
};

const FileSearchIcon = () => (
    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);