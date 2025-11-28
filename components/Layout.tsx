import React from 'react';
import { ViewState } from '../App';
import { ShieldCheck, Activity, FileSearch, Newspaper, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => onNavigate(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
          : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800 p-6 hidden md:flex flex-col z-20">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => onNavigate(ViewState.HOME)}>
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Veritas AI</span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem view={ViewState.DEEPFAKE} icon={Activity} label="Deepfake Detector" />
          <NavItem view={ViewState.JOB_SCAM} icon={FileSearch} label="Job Vetting" />
          <NavItem view={ViewState.NEWS_CHECK} icon={Newspaper} label="News Veracity" />
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Powered By</h4>
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300 font-medium">Google Gemini</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
           <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <span className="font-bold">Veritas AI</span>
           </div>
           {currentView !== ViewState.HOME && (
             <button onClick={() => onNavigate(ViewState.HOME)} className="text-sm text-slate-400">Back</button>
           )}
        </div>

        {children}
      </main>
    </div>
  );
};