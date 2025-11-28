import React, { useState } from 'react';
import { ShieldCheck, FileSearch, Newspaper, Activity } from 'lucide-react';
import { Layout } from './components/Layout';
import { DeepfakeModule } from './components/DeepfakeModule';
import { JobModule } from './components/JobModule';
import { NewsModule } from './components/NewsModule';
import { ChatWidget } from './components/ChatWidget';

export enum ViewState {
  HOME = 'HOME',
  DEEPFAKE = 'DEEPFAKE',
  JOB_SCAM = 'JOB_SCAM',
  NEWS_CHECK = 'NEWS_CHECK'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DEEPFAKE:
        return <DeepfakeModule />;
      case ViewState.JOB_SCAM:
        return <JobModule />;
      case ViewState.NEWS_CHECK:
        return <NewsModule />;
      case ViewState.HOME:
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-fade-in">
             <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-75"></div>
                <div className="relative bg-slate-950 rounded-full p-6 ring-1 ring-white/10">
                   <ShieldCheck className="w-20 h-20 text-indigo-400" />
                </div>
             </div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              Veritas AI
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              The multi-modal digital integrity platform. Detect deepfakes, verify employment opportunities, and fact-check news with the power of Google Gemini.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
              <button 
                onClick={() => setCurrentView(ViewState.DEEPFAKE)}
                className="group relative p-6 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="p-3 bg-indigo-500/10 rounded-xl mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <Activity className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Deepfake Detector</h3>
                <p className="text-sm text-slate-400">Analyze images and videos for signs of AI manipulation.</p>
              </button>

              <button 
                onClick={() => setCurrentView(ViewState.JOB_SCAM)}
                className="group relative p-6 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="p-3 bg-emerald-500/10 rounded-xl mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <FileSearch className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Job Vetting</h3>
                <p className="text-sm text-slate-400">Verify legitimacy of job offers and detect recruitment scams.</p>
              </button>

              <button 
                onClick={() => setCurrentView(ViewState.NEWS_CHECK)}
                className="group relative p-6 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="p-3 bg-amber-500/10 rounded-xl mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Newspaper className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">News Veracity</h3>
                <p className="text-sm text-slate-400">Fact-check claims and headlines using real-time search grounding.</p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderContent()}
      <ChatWidget />
    </Layout>
  );
};

export default App;