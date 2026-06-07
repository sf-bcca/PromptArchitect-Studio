import React, { useState, useEffect } from 'react';
import { useUserSettings } from '../context/UserSettingsContext';
import { MODELS, Theme } from '../types';
import { Capacitor } from '@capacitor/core';
import { NativeAI } from '../services/nativeAiPlugin';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { settings, updateSettings, theme, setTheme } = useUserSettings();

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ default_model: e.target.value });
  };

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'system', label: 'System', icon: '🖥️' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Studio Settings
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Appearance */}
        <section>
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block">
            Appearance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  theme === t.value
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-xl mb-1">{t.icon}</span>
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Defaults */}
        <section>
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 block">
            Default LLM Model
          </label>
          <select
            value={settings?.default_model || 'gemini-3.1-flash'}
            onChange={handleModelChange}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id === 'gemma-4-local' && Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
                  ? 'Gemma 4 (Local On-Device)'
                  : m.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">
            This model will be selected by default every time you open the studio.
          </p>
        </section>

        {/* On-Device Gemma 4 Downloader (Android Only) */}
        {Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android' && (
          <GemmaDownloaderSection />
        )}
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const GemmaDownloaderSection: React.FC = () => {
  const [available, setAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const res = await NativeAI.isModelAvailable();
      setAvailable(res.available);
      setIsDownloading(res.isDownloading);
      setProgress(res.downloadProgress);
      setError(res.error);
    } catch (e: any) {
      console.error('Failed to check Gemma status', e);
    }
  };

  useEffect(() => {
    checkStatus();

    let listener: any = null;

    const setupListener = async () => {
      listener = await NativeAI.addListener('downloadProgress', (data) => {
        setProgress(data.progress);
        if (data.status === 'COMPLETED') {
          setAvailable(true);
          setIsDownloading(false);
        } else if (data.status === 'FAILED') {
          setIsDownloading(false);
          setError(data.error || 'Download failed');
        } else if (data.status === 'DOWNLOADING') {
          setIsDownloading(true);
        }
      });
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  const handleDownload = async () => {
    try {
      setError(null);
      setIsDownloading(true);
      setProgress(0);
      await NativeAI.downloadModel();
    } catch (e: any) {
      setIsDownloading(false);
      setError(e.message || 'Failed to start download');
    }
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
        On-Device AI Model (Gemma 4)
      </label>

      {available ? (
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Model is downloaded and ready for offline use.</span>
        </div>
      ) : isDownloading ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Downloading Gemma 4...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            Please keep the app open and connected to Wi-Fi. This download is approximately 1.3 GB.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Download the Gemma 4 model to enable offline, private prompt engineering directly on your Pixel.
          </p>
          <button
            onClick={handleDownload}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-98"
          >
            Download Gemma 4 Model (~1.3 GB)
          </button>
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-500 font-medium">
          Error: {error}
        </div>
      )}
    </section>
  );
};

export default SettingsPanel;
