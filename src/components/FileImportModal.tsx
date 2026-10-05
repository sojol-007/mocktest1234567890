import React, { useState, useRef } from 'react';
import { BuildingData, ValidationResult, Language } from '../types';
import { validateBuildingData } from '../utils/validation';
import { translations } from '../utils/i18n';
import { DEFAULT_BUILDING, PRESET_COMPLEX_CAMPUS } from '../data/defaultBuilding';
import { Upload, FileCode, CheckCircle2, AlertCircle, Download, X, RefreshCw, FileText } from 'lucide-react';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadData: (newData: BuildingData) => void;
  currentData: BuildingData;
  lang: Language;
}

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  onLoadData,
  currentData,
  lang
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [jsonText, setJsonText] = useState<string>(() => JSON.stringify(currentData, null, 2));
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parsedObject, setParsedObject] = useState<BuildingData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleProcessJsonString = (str: string, sourceName: string) => {
    setJsonText(str);
    setFileName(sourceName);
    try {
      const parsed = JSON.parse(str);
      const res = validateBuildingData(parsed);
      setValidationResult(res);
      if (res.isValid) {
        setParsedObject(parsed as BuildingData);
      } else {
        setParsedObject(null);
      }
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        errors: [{
          en: `JSON Syntax Error: ${err.message}`,
          bn: `JSON সিনট্যাক্স ত্রুটি: ${err.message}`
        }],
        warnings: []
      });
      setParsedObject(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessJsonString(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleProcessJsonString(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleApply = () => {
    if (parsedObject && validationResult?.isValid) {
      onLoadData(parsedObject);
      onClose();
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([JSON.stringify(DEFAULT_BUILDING, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'building.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPreset = (preset: BuildingData, name: string) => {
    handleProcessJsonString(JSON.stringify(preset, null, 2), name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-600/40 text-sky-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t.modalImportTitle}</h2>
              <p className="text-xs text-slate-400">{t.modalImportDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {lang === 'EN' ? 'Quick Presets:' : 'দ্রুত প্রিসেট:'}
            </span>
            <button
              type="button"
              onClick={() => handleLoadPreset(DEFAULT_BUILDING, 'AI DevFest Test Facility (Default)')}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors border border-slate-700"
            >
              {t.presetDefault}
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset(PRESET_COMPLEX_CAMPUS, 'Science Labs (Multi-Wing)')}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors border border-slate-700"
            >
              {t.presetComplex}
            </button>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="ml-auto px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 font-medium transition-colors border border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadSampleJson}</span>
            </button>
          </div>

          {/* Drag & Drop / File Input Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive
                ? 'border-sky-500 bg-sky-950/20'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <div className="text-sm font-semibold text-slate-200">
                {t.dropJsonHere}
              </div>
              <div className="text-xs text-slate-500">
                {fileName ? (
                  <span className="text-sky-400 font-mono font-medium">
                    {lang === 'EN' ? 'Selected file:' : 'নির্বাচিত ফাইল:'} {fileName}
                  </span>
                ) : (
                  <span>{lang === 'EN' ? 'Supports UTF-8 .json files up to 60 nodes and 150 edges' : '৬০ নোড ও ১৫০ করিডোর বিশিষ্ট .json ফাইল সমর্থিত'}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                {t.orBrowseFile}
              </button>
            </div>
          </div>

          {/* Validation Status Box */}
          {validationResult && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                validationResult.isValid
                  ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200'
                  : 'bg-red-950/70 border-red-500/80 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                {validationResult.isValid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.validationPassed}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>{t.validationFailed}</span>
                  </>
                )}
              </div>

              {!validationResult.isValid && (
                <ul className="mt-2 space-y-1 pl-5 list-disc text-[11px] text-red-300">
                  {validationResult.errors.map((err, idx) => (
                    <li key={idx}>
                      <strong className="font-mono text-red-200">{err.field ? `[${err.field}]: ` : ''}</strong>
                      {lang === 'EN' ? err.en : err.bn}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Direct JSON Inspector / Editor */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>{lang === 'EN' ? 'Raw JSON Content:' : 'র JSON কোড:'}</span>
              <button
                type="button"
                onClick={() => handleProcessJsonString(jsonText, 'manual-edit.json')}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{lang === 'EN' ? 'Validate Text' : 'যাচাই করুন'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => handleProcessJsonString(e.target.value, 'manual-edit.json')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 select-text"
              placeholder="{ ... }"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            {t.close}
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!validationResult?.isValid || !parsedObject}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              validationResult?.isValid && parsedObject
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {t.applyData}
          </button>
        </div>
      </div>
    </div>
  );
};
