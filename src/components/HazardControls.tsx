import React from 'react';
import { BuildingData, InteractionMode, Language } from '../types';
import { translations } from '../utils/i18n';
import { Flame, Ban, RotateCcw, Trash2, MapPin, Zap, AlertTriangle, CheckCircle, Crosshair } from 'lucide-react';

interface HazardControlsProps {
  buildingData: BuildingData;
  startNodeId: string;
  blockedNodes: Set<string>;
  blockedEdges: Set<string>;
  closedExits: Set<string>;
  interactionMode: InteractionMode;
  lang: Language;
  onSelectStart: (nodeId: string) => void;
  onSetInteractionMode: (mode: InteractionMode) => void;
  onToggleNodeBlock: (nodeId: string) => void;
  onToggleEdgeBlock: (edgeId: string) => void;
  onToggleExitClose: (exitId: string) => void;
  onResetToInitialState: () => void;
  onClearAllHazards: () => void;
}

export const HazardControls: React.FC<HazardControlsProps> = ({
  buildingData,
  startNodeId,
  blockedNodes,
  blockedEdges,
  closedExits,
  interactionMode,
  lang,
  onSelectStart,
  onSetInteractionMode,
  onToggleNodeBlock,
  onToggleEdgeBlock,
  onToggleExitClose,
  onResetToInitialState,
  onClearAllHazards
}) => {
  const t = translations[lang];

  const totalHazards = blockedNodes.size + blockedEdges.size + closedExits.size;

  // Filter available rooms and junctions for start selector
  const availableStartNodes = buildingData.nodes.filter(n => n.type !== 'exit');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4 backdrop-blur">
      {/* 1. Mode Switcher (Select Start vs Toggle Hazards) */}
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
          {lang === 'EN' ? 'Map Click Mode' : 'মানচিত্রে ক্লিক মোড'}
        </div>
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onSetInteractionMode('start')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all ${
              interactionMode === 'start'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.modeSelectStart}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetInteractionMode('hazard')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all ${
              interactionMode === 'hazard'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.modeToggleHazard}</span>
          </button>
        </div>
      </div>

      {/* 2. Fast Start Location Picker */}
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>{t.activeStart}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {buildingData.nodes.find(n => n.id === startNodeId)?.type || ''}
          </span>
        </div>
        <select
          value={startNodeId}
          onChange={(e) => onSelectStart(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          {availableStartNodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.id} — {node.label} ({node.type}) {blockedNodes.has(node.id) ? '⚠️ [BLOCKED]' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Hazard List Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.hazardsTitle}</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {totalHazards} {lang === 'EN' ? 'active' : 'সক্রিয়'}
          </span>
        </div>

        {totalHazards === 0 ? (
          <div className="text-xs text-slate-500 italic py-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{t.noHazardsActive}</span>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {/* Blocked Nodes List */}
            {blockedNodes.size > 0 && (
              <div>
                <div className="text-[11px] font-medium text-red-400 mb-1 flex items-center justify-between">
                  <span>{t.blockedNodes} ({blockedNodes.size}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(blockedNodes).map(nodeId => (
                    <button
                      key={nodeId}
                      type="button"
                      onClick={() => onToggleNodeBlock(nodeId)}
                      title={lang === 'EN' ? 'Click to unblock node' : 'নোড অবমুক্ত করতে ক্লিক করুন'}
                      className="px-2 py-1 rounded bg-red-950/80 border border-red-700/80 text-red-300 hover:bg-red-900 font-mono text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>{nodeId}</span>
                      <span className="text-red-400 font-bold ml-1">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blocked Edges List */}
            {blockedEdges.size > 0 && (
              <div>
                <div className="text-[11px] font-medium text-amber-400 mb-1 flex items-center justify-between">
                  <span>{t.blockedEdges} ({blockedEdges.size}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(blockedEdges).map(edgeId => {
                    const edgeObj = buildingData.edges.find(e => e.id === edgeId);
                    return (
                      <button
                        key={edgeId}
                        type="button"
                        onClick={() => onToggleEdgeBlock(edgeId)}
                        title={lang === 'EN' ? 'Click to unblock corridor' : 'করিডোর অবমুক্ত করতে ক্লিক করুন'}
                        className="px-2 py-1 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 hover:bg-amber-900 font-mono text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>{edgeObj ? `${edgeObj.from}⟷${edgeObj.to}` : edgeId}</span>
                        <span className="text-amber-400 font-bold ml-1">×</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Closed Exits List */}
            {closedExits.size > 0 && (
              <div>
                <div className="text-[11px] font-medium text-rose-400 mb-1 flex items-center justify-between">
                  <span>{t.closedExits} ({closedExits.size}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(closedExits).map(exitId => (
                    <button
                      key={exitId}
                      type="button"
                      onClick={() => onToggleExitClose(exitId)}
                      title={lang === 'EN' ? 'Click to reopen exit' : 'প্রস্থান পুনরায় খুলতে ক্লিক করুন'}
                      className="px-2 py-1 rounded bg-rose-950/80 border border-rose-700/80 text-rose-300 hover:bg-rose-900 font-mono text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>{exitId}</span>
                      <span className="text-rose-400 font-bold ml-1">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Action Buttons (Reset to Initial & Clear All) */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onResetToInitialState}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          title={lang === 'EN' ? 'Restore hazards to initial_state from file' : 'ফাইলে উল্লেখিত প্রাথমিক অবস্থায় ফিরিয়ে আনুন'}
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.resetHazards}</span>
        </button>

        <button
          type="button"
          onClick={onClearAllHazards}
          disabled={totalHazards === 0}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors border ${
            totalHazards === 0
              ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-red-950/70 border-slate-700 hover:border-red-800 text-red-300'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span>{t.clearAllHazards}</span>
        </button>
      </div>
    </div>
  );
};
