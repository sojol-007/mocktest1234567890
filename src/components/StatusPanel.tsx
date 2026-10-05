import React from 'react';
import { DijkstraPathResult, Language, BuildingData } from '../types';
import { translations } from '../utils/i18n';
import { ShieldAlert, AlertOctagon, CheckCircle2, ArrowRight, Compass, ShieldCheck, Flame, Scale } from 'lucide-react';

interface StatusPanelProps {
  routeResult: DijkstraPathResult;
  buildingData: BuildingData;
  lang: Language;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  routeResult,
  buildingData,
  lang
}) => {
  const t = translations[lang];

  const startNode = buildingData.nodes.find(n => n.id === routeResult.startNodeId);
  const targetExit = buildingData.nodes.find(n => n.id === routeResult.targetExitId);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-4 backdrop-blur">
      {/* 1. Header & Primary Simulation Status Banner */}
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>{t.status}</span>
          <span className="font-mono text-[10px] text-slate-500">Dijkstra v2.4</span>
        </div>

        {/* STATUS 1: STARTING LOCATION BLOCKED */}
        {routeResult.status === 'START_BLOCKED' && (
          <div className="p-4 rounded-lg bg-red-950/80 border border-red-500/80 text-red-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-base font-bold text-red-100">
              <Flame className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
              <span>{lang === 'EN' ? 'Starting location blocked' : 'শুরু করার স্থানটি অবরুদ্ধ'}</span>
            </div>
            <p className="mt-1.5 text-xs text-red-300/90 leading-relaxed">
              {t.statusStartBlockedDesc}
            </p>
          </div>
        )}

        {/* STATUS 2: NO ROUTE AVAILABLE */}
        {routeResult.status === 'NO_ROUTE' && (
          <div className="p-4 rounded-lg bg-amber-950/80 border border-amber-500/80 text-amber-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-base font-bold text-amber-100">
              <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{lang === 'EN' ? 'No route available' : 'কোনো পথ পাওয়া যায়নি'}</span>
            </div>
            <p className="mt-1.5 text-xs text-amber-300/90 leading-relaxed">
              {t.statusNoRouteDesc}
            </p>
          </div>
        )}

        {/* STATUS 3: ROUTE FOUND (OPTIMAL) */}
        {routeResult.status === 'OK' && (
          <div className="p-4 rounded-lg bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-base font-bold text-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{t.statusRouteFound}</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase text-emerald-400 font-semibold tracking-wide">
                  {t.totalCost}:
                </span>
                <span className="ml-2 font-mono text-xl font-black text-emerald-300">
                  {routeResult.totalCost}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Origin / Start */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div className="text-[11px] text-slate-400 font-medium">{t.activeStart}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-base font-bold text-sky-400">
              {routeResult.startNodeId || '—'}
            </span>
            {startNode && (
              <span className="text-xs text-slate-400 truncate">
                ({startNode.label})
              </span>
            )}
          </div>
        </div>

        {/* Target Exit */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div className="text-[11px] text-slate-400 font-medium">{t.targetExit}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-base font-bold text-emerald-400">
              {routeResult.targetExitId || '—'}
            </span>
            {targetExit && (
              <span className="text-xs text-slate-400 truncate">
                ({targetExit.label})
              </span>
            )}
          </div>
        </div>

        {/* Total Cost */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div className="text-[11px] text-slate-400 font-medium">{t.totalCost}</div>
          <div className="mt-1">
            <span className="font-mono text-base font-bold text-amber-300">
              {routeResult.totalCost !== null ? routeResult.totalCost : '—'}
            </span>
            <span className="text-[11px] text-slate-500 ml-1.5 font-normal">
              {routeResult.totalCost !== null ? (lang === 'EN' ? 'units' : 'একক') : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Full Node-by-Node Path Sequence */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg">
        <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span>{t.evacuationPath}</span>
          {routeResult.nodePath.length > 0 && (
            <span className="text-[11px] text-slate-400 font-mono">
              {routeResult.nodePath.length} {lang === 'EN' ? 'nodes' : 'নোড'} ({routeResult.edgePath.length} {lang === 'EN' ? 'steps' : 'ধাপ'})
            </span>
          )}
        </div>

        {routeResult.nodePath.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            {routeResult.nodePath.map((nodeId, idx) => {
              const nodeObj = buildingData.nodes.find(n => n.id === nodeId);
              const isStart = idx === 0;
              const isExit = idx === routeResult.nodePath.length - 1;

              return (
                <React.Fragment key={`${nodeId}-${idx}`}>
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-xs font-semibold shadow-sm transition-all ${
                      isStart
                        ? 'bg-sky-950 text-sky-300 border border-sky-600/80 ring-1 ring-sky-500/30'
                        : isExit
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 ring-1 ring-emerald-500/40'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{nodeId}</span>
                    {nodeObj && (
                      <span className="text-[10px] opacity-75 font-sans font-normal hidden md:inline">
                        ({nodeObj.label})
                      </span>
                    )}
                  </div>
                  {idx < routeResult.nodePath.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-1">
            {routeResult.status === 'START_BLOCKED'
              ? (lang === 'EN' ? 'No path: Origin is blocked.' : 'কোনো পথ নেই: শুরুর স্থানটি অবরুদ্ধ।')
              : (lang === 'EN' ? 'No evacuation route can reach any open exit.' : 'উন্মুক্ত প্রস্থানে পৌঁছানোর কোনো পথ নেই।')}
          </div>
        )}
      </div>

      {/* 4. All Exits Reachability Breakdown */}
      <div className="border-t border-slate-800/80 pt-3">
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span>{t.allExitsStatus}</span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Scale className="w-3 h-3 text-slate-400" />
            {t.tieBreakerRule1}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {routeResult.allExitCosts.map(exitInfo => {
            const isWinner = exitInfo.exitId === routeResult.targetExitId;
            return (
              <div
                key={exitInfo.exitId}
                className={`p-2 rounded-md border flex items-center justify-between transition-colors ${
                  isWinner
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                    : exitInfo.isClosed
                    ? 'bg-red-950/20 border-red-900/40 text-red-400/80'
                    : exitInfo.isReachable
                    ? 'bg-slate-950/40 border-slate-800 text-slate-300'
                    : 'bg-slate-950/20 border-slate-900 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{exitInfo.exitId}</span>
                  <span className="text-slate-400 text-[11px] truncate max-w-[130px]">
                    {exitInfo.label}
                  </span>
                </div>

                <div className="text-right font-mono">
                  {exitInfo.isClosed ? (
                    <span className="text-[10px] text-red-400 uppercase font-sans font-medium px-1.5 py-0.5 rounded bg-red-950/60">
                      {t.closedStatus}
                    </span>
                  ) : exitInfo.isReachable ? (
                    <span className={`text-xs font-bold ${isWinner ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {t.corridorCost}: {exitInfo.cost}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 uppercase font-sans">
                      {t.openUnreachable}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
