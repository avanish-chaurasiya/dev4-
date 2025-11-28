import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, CheckCircle, Video, Image as ImageIcon } from 'lucide-react';
import { Card, Button, FileUpload, Badge } from './UI';
import { analyzeMediaForDeepfake } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const DeepfakeModule: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
  };

  const processFile = async () => {
    if (!file || !preview) return;
    setLoading(true);

    try {
      let base64Data = "";
      let mimeType = file.type;

      if (file.type.startsWith('video/')) {
        // Extract frame from video
        if (videoRef.current) {
          const video = videoRef.current;
          
          // Pause to capture the current visible frame clearly
          if (!video.paused) {
            video.pause();
          }

          // Ensure video is ready
          await new Promise((resolve) => {
            if (video.readyState >= 2) resolve(true);
            else video.onloadeddata = () => resolve(true);
          });
          
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
          mimeType = 'image/jpeg'; // Sending frame as image
        }
      } else {
        // Handle Image
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => (reader.onload = resolve));
        base64Data = (reader.result as string).split(',')[1];
      }

      const analysis = await analyzeMediaForDeepfake(base64Data, mimeType);
      setResult(analysis);

    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: 'AI Generated', value: result.percentAI || 0 },
    { name: 'Authentic', value: 100 - (result.percentAI || 0) },
  ] : [];

  const COLORS = ['#ef4444', '#10b981'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">Deepfake & Media Forensics</h2>
           <p className="text-slate-400">Analyze visual content for manipulation artifacts using Gemini 3 Pro.</p>
        </div>
        <div className="hidden md:block">
            <Badge color="blue">Gemini 3 Pro Vision</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">Input Media</h3>
              {file && <Badge color="gray">{file.type.startsWith('video') ? 'VIDEO' : 'IMAGE'}</Badge>}
            </div>
            
            {!file ? (
              <FileUpload onFileSelect={handleFileSelect} accept="image/*,video/*" label="JPG, PNG, MP4, MOV" />
            ) : (
              <div className="space-y-4">
                 <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                    {file.type.startsWith('video/') ? (
                        <video ref={videoRef} src={preview!} controls className="max-h-full max-w-full" />
                    ) : (
                        <img src={preview!} alt="Upload" className="max-h-full max-w-full object-contain" />
                    )}
                 </div>
                 <div className="flex gap-3">
                    <Button onClick={processFile} isLoading={loading} className="flex-1">
                        {loading ? 'Analyzing...' : (file.type.startsWith('video/') ? 'Analyze Current Frame' : 'Run Forensic Analysis')}
                    </Button>
                    <Button variant="outline" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
                        Reset
                    </Button>
                 </div>
              </div>
            )}
          </Card>

           {/* Education Section */}
           <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <Video className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                      <h4 className="font-medium text-indigo-200">How Video Analysis Works</h4>
                      <p className="text-sm text-indigo-200/70 mt-1">
                          For videos, pause on the moment you wish to inspect. We extract a high-fidelity keyframe from the current timestamp. 
                          Gemini 3 Pro then analyzes this frame for temporal consistency artifacts, unnatural warping, and digital synthesis signatures.
                      </p>
                  </div>
              </div>
           </div>
        </div>

        {/* Results Area */}
        <div className="space-y-6">
            {result ? (
                <div className="space-y-6 animate-slide-up">
                    <Card className="p-6 border-l-4 border-l-indigo-500">
                        <h3 className="text-lg font-semibold text-white mb-4">Forensic Verdict</h3>
                        <div className="flex items-center gap-6 mb-6">
                             <div className="w-32 h-32 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-2xl font-bold text-white">{result.percentAI}%</span>
                                    <span className="text-[10px] text-slate-400 uppercase">AI Score</span>
                                </div>
                             </div>
                             <div>
                                 <div className={`text-2xl font-bold mb-1 ${
                                     result.verdict.includes('GENERATED') ? 'text-rose-500' : 
                                     result.verdict.includes('AUTHENTIC') ? 'text-emerald-500' : 'text-amber-500'
                                 }`}>
                                     {result.verdict}
                                 </div>
                                 <p className="text-slate-400 text-sm">
                                     Confidence score indicates the probability of synthetic media generation artifacts.
                                 </p>
                             </div>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Analysis Details</h4>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {result.details}
                            </p>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">Awaiting Media</h3>
                    <p className="text-slate-500 max-w-sm mt-2">Upload an image or video to begin the forensic analysis process.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};