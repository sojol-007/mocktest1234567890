import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/i18n';
import { Compass, Upload, RotateCcw, Camera, Languages, HelpCircle } from 'lucide-react';

interface HeaderProps {
  buildingName: string;
  lang: Language;
  onToggleLang: (newLang: Language) => void;
  onOpenImportModal: () => void;
  onResetToInitialState: () => void;
  onExportPng: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  buildingName,
  lang,
  onToggleLang,
  onOpenImportModal,
  onResetToInitialState,
  onExportPng,
  onOpenHelp
}) => {
  const t = translations[lang];

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                {t.appName}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Bilingual Switcher [ EN | BN ] */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => onToggleLang('EN')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                lang === 'EN'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('BN')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                lang === 'BN'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BN
            </button>
          </div>

          {/* Import JSON Button */}
          <button
            type="button"
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{t.importJson}</span>
          </button>

          {/* Reset Hazards Button */}
          <button
            type="button"
            onClick={onResetToInitialState}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            title={t.resetHazards}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{t.resetHazards}</span>
          </button>

          {/* PNG Export Button */}
          <button
            type="button"
            onClick={onExportPng}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 transition-colors border border-emerald-700/80 shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.exportPng}</span>
          </button>

          {/* Help modal button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title={lang === 'EN' ? 'Help & Algorithm Rules' : 'সাহায্য ও অ্যালগরিদম নিয়মাবলী'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
