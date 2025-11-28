import React, { useState } from 'react';
import { verifyNews } from '../services/geminiService';
import { NewsAnalysisResult } from '../types';
import { Card, Button, FileUpload, Badge } from './UI';
import { Globe, Link as LinkIcon, ExternalLink } from 'lucide-react';

export const NewsModule: React.FC = () => {
  const [claim, setClaim] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NewsAnalysisResult | null>(null);

  const handleVerify = async () => {
    if (!claim && !image) return;
    setLoading(true);
    try {
        let base64 = undefined;
        if (image) {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            await new Promise(r => reader.onload = r);
            base64 = (reader.result as string).split(',')[1];
        }
        const data = await verifyNews(claim || "Analyze this image for news veracity", base64);
        setResult(data);
    } catch (e) {
        alert("Verification failed.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
       <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">News Veracity Check</h2>
          <p className="text-slate-400">Grounded fact-checking with Google Search.</p>
       </div>

       <Card className="p-6 bg-slate-900/80 backdrop-blur">
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Headline or Claim</label>
                <input 
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. 'Breaking: Eiffel Tower is being demolished'"
                  value={claim}
                  onChange={(e) => setClaim(e.target.value)}
                />
             </div>
             
             {!image ? (
                 <div className="border border-slate-800 rounded-lg p-2 bg-slate-950">
                     <button className="text-xs text-indigo-400 hover:underline px-2" onClick={() => document.getElementById('news-upload')?.click()}>
                        + Add Screenshot/Image (Optional)
                     </button>
                     <input id="news-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                 </div>
             ) : (
                 <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
                     <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden">
                        <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="prev" />
                     </div>
                     <span className="text-sm text-slate-300 flex-1 truncate">{image.name}</span>
                     <button onClick={() => setImage(null)} className="text-xs text-rose-400 hover:text-rose-300 px-2">Remove</button>
                 </div>
             )}

             <Button onClick={handleVerify} isLoading={loading} className="w-full">
                Verify with Google Search
             </Button>
          </div>
       </Card>

       {result && (
           <div className="animate-slide-up space-y-6">
               <div className={`p-1 rounded-2xl bg-gradient-to-r ${
                   result.verdict === 'REAL' ? 'from-emerald-500 to-teal-500' :
                   result.verdict === 'FAKE' ? 'from-rose-500 to-red-500' : 'from-amber-500 to-orange-500'
               }`}>
                   <div className="bg-slate-900 rounded-xl p-6">
                       <div className="flex items-center justify-between mb-4">
                           <h3 className="text-xl font-bold text-white">Fact Check Result</h3>
                           <Badge color={
                               result.verdict === 'REAL' ? 'green' :
                               result.verdict === 'FAKE' ? 'red' : 'yellow'
                           }>{result.verdict}</Badge>
                       </div>
                       <p className="text-lg text-slate-200 leading-relaxed font-medium">
                           {result.correction}
                       </p>
                   </div>
               </div>

               <div className="grid gap-4 sm:grid-cols-2">
                   {result.sources.map((source, i) => (
                       <a 
                         key={i} 
                         href={source.uri} 
                         target="_blank" 
                         rel="noreferrer"
                         className="flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group"
                       >
                           <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20">
                               <Globe className="w-5 h-5 text-indigo-400" />
                           </div>
                           <div className="flex-1 min-w-0">
                               <h4 className="text-sm font-medium text-slate-200 truncate">{source.title}</h4>
                               <p className="text-xs text-slate-500 truncate mt-0.5">{source.uri}</p>
                           </div>
                           <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                       </a>
                   ))}
               </div>
           </div>
       )}
    </div>
  );
};