/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { BuildingData, InteractionMode, Language } from './types';
import { DEFAULT_BUILDING } from './data/defaultBuilding';
import { computeShortestEvacuationRoute } from './utils/dijkstra';
import { Header } from './components/Header';
import { MapViewer } from './components/MapViewer';
import { StatusPanel } from './components/StatusPanel';
import { HazardControls } from './components/HazardControls';
import { FileImportModal } from './components/FileImportModal';
import { HelpModal } from './components/HelpModal';
import { exportSvgToPng } from './utils/exportPng';
import { translations } from './utils/i18n';
import { Info, Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [buildingData, setBuildingData] = useState<BuildingData>(DEFAULT_BUILDING);
  const [startNodeId, setStartNodeId] = useState<string>('R1');
  const [blockedNodes, setBlockedNodes] = useState<Set<string>>(
    () => new Set(DEFAULT_BUILDING.initial_state.blocked_nodes)
  );
  const [blockedEdges, setBlockedEdges] = useState<Set<string>>(
    () => new Set(DEFAULT_BUILDING.initial_state.blocked_edges)
  );
  const [closedExits, setClosedExits] = useState<Set<string>>(
    () => new Set(DEFAULT_BUILDING.initial_state.closed_exits)
  );
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('start');
  const [lang, setLang] = useState<Language>('EN');

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SVG ref for PNG export
  const svgRef = useRef<SVGSVGElement | null>(null);

  const t = translations[lang];

  // Show a momentary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Compute Shortest Evacuation Route using strict Dijkstra
  const routeResult = useMemo(() => {
    return computeShortestEvacuationRoute({
      buildingData,
      startNodeId,
      blockedNodes,
      blockedEdges,
      closedExits
    });
  }, [buildingData, startNodeId, blockedNodes, blockedEdges, closedExits]);

  // Handlers for toggles
  const handleSelectStart = useCallback((nodeId: string) => {
    setStartNodeId(nodeId);
    showToast(
      lang === 'EN'
        ? `Evacuation origin set to ${nodeId}`
        : `উদ্ধার শুরুর স্থান ${nodeId} নির্ধারণ করা হয়েছে`
    );
  }, [lang, showToast]);

  const handleToggleNodeBlock = useCallback((nodeId: string) => {
    setBlockedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
        showToast(lang === 'EN' ? `Node ${nodeId} unblocked` : `নোড ${nodeId} অবমুক্ত করা হয়েছে`);
      } else {
        next.add(nodeId);
        showToast(lang === 'EN' ? `Node ${nodeId} blocked by hazard` : `নোড ${nodeId} অবরুদ্ধ করা হয়েছে`);
      }
      return next;
    });
  }, [lang, showToast]);

  const handleToggleEdgeBlock = useCallback((edgeId: string) => {
    setBlockedEdges(prev => {
      const next = new Set(prev);
      const edge = buildingData.edges.find(e => e.id === edgeId);
      const edgeLabel = edge ? `${edge.from} ⟷ ${edge.to}` : edgeId;
      if (next.has(edgeId)) {
        next.delete(edgeId);
        showToast(lang === 'EN' ? `Corridor ${edgeLabel} cleared` : `করিডোর ${edgeLabel} উন্মুক্ত করা হয়েছে`);
      } else {
        next.add(edgeId);
        showToast(lang === 'EN' ? `Corridor ${edgeLabel} blocked` : `করিডোর ${edgeLabel} অবরুদ্ধ করা হয়েছে`);
      }
      return next;
    });
  }, [buildingData.edges, lang, showToast]);

  const handleToggleExitClose = useCallback((exitId: string) => {
    setClosedExits(prev => {
      const next = new Set(prev);
      if (next.has(exitId)) {
        next.delete(exitId);
        showToast(lang === 'EN' ? `Exit ${exitId} reopened` : `জরুরি প্রস্থান ${exitId} পুনরায় খোলা হয়েছে`);
      } else {
        next.add(exitId);
        showToast(lang === 'EN' ? `Exit ${exitId} sealed / closed` : `জরুরি প্রস্থান ${exitId} বন্ধ করা হয়েছে`);
      }
      return next;
    });
  }, [lang, showToast]);

  const handleResetToInitialState = useCallback(() => {
    setBlockedNodes(new Set(buildingData.initial_state.blocked_nodes));
    setBlockedEdges(new Set(buildingData.initial_state.blocked_edges));
    setClosedExits(new Set(buildingData.initial_state.closed_exits));
    showToast(
      lang === 'EN'
        ? 'Restored building hazards to file initial state'
        : 'ফাইলে উল্লেখিত প্রাথমিক অবস্থায় সফলভাবে রিসেট করা হয়েছে'
    );
  }, [buildingData.initial_state, lang, showToast]);

  const handleClearAllHazards = useCallback(() => {
    setBlockedNodes(new Set());
    setBlockedEdges(new Set());
    setClosedExits(new Set());
    showToast(
      lang === 'EN'
        ? 'Cleared all building hazards and blockages'
        : 'সকল বিপদ ও প্রতিবন্ধকতা অপসারণ করা হয়েছে'
    );
  }, [lang, showToast]);

  const handleLoadNewBuildingData = useCallback((newData: BuildingData) => {
    setBuildingData(newData);
    // Find initial start node (prefer first room, otherwise first node)
    const firstRoom = newData.nodes.find(n => n.type === 'room');
    const newStart = firstRoom ? firstRoom.id : newData.nodes[0]?.id || 'R1';
    setStartNodeId(newStart);

    // Set initial hazards from the imported file
    setBlockedNodes(new Set(newData.initial_state.blocked_nodes));
    setBlockedEdges(new Set(newData.initial_state.blocked_edges));
    setClosedExits(new Set(newData.initial_state.closed_exits));

    showToast(
      lang === 'EN'
        ? `Loaded building: "${newData.building}"`
        : `ভবন ডেটা সফলভাবে লোড হয়েছে: "${newData.building}"`
    );
  }, [lang, showToast]);

  const handleExportPng = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      await exportSvgToPng(
        svgRef.current,
        buildingData.building,
        startNodeId,
        routeResult.targetExitId,
        routeResult.totalCost
      );
      showToast(
        lang === 'EN'
          ? 'Snapshot PNG exported successfully'
          : 'মানচিত্রের স্ন্যাপশট PNG সফলভাবে এক্সপোর্ট হয়েছে'
      );
    } catch (err: any) {
      showToast(
        lang === 'EN'
          ? `Export failed: ${err.message}`
          : `এক্সপোর্ট ব্যর্থ হয়েছে: ${err.message}`
      );
    }
  }, [buildingData.building, startNodeId, routeResult.targetExitId, routeResult.totalCost, lang, showToast]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Header
        buildingName={buildingData.building}
        lang={lang}
        onToggleLang={setLang}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onResetToInitialState={handleResetToInitialState}
        onExportPng={handleExportPng}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Simulation Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* Top Info Banner for Context */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              {lang === 'EN' ? 'Facility:' : 'ভবন:'}
            </span>
            <span className="text-sky-400 font-medium">{buildingData.building}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>{t.tieBreakerRule1}</span>
            <span className="hidden lg:inline text-slate-600">•</span>
            <span className="hidden lg:inline">{t.tieBreakerRule2}</span>
          </div>
        </div>

        {/* Core Layout: Left/Top Map View, Right/Bottom Control & Status Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          {/* Map Section (8 columns on large screens) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[480px]">
            <MapViewer
              buildingData={buildingData}
              startNodeId={startNodeId}
              blockedNodes={blockedNodes}
              blockedEdges={blockedEdges}
              closedExits={closedExits}
              routeResult={routeResult}
              interactionMode={interactionMode}
              lang={lang}
              onSelectStart={handleSelectStart}
              onToggleNodeBlock={handleToggleNodeBlock}
              onToggleEdgeBlock={handleToggleEdgeBlock}
              onToggleExitClose={handleToggleExitClose}
              svgRef={svgRef}
            />
          </div>

          {/* Sidebar Panels (5 columns on large screens) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
            {/* Status Panel (Active route, path sequence, cost, status errors) */}
            <StatusPanel
              routeResult={routeResult}
              buildingData={buildingData}
              lang={lang}
            />

            {/* Hazard & Interaction Controls */}
            <HazardControls
              buildingData={buildingData}
              startNodeId={startNodeId}
              blockedNodes={blockedNodes}
              blockedEdges={blockedEdges}
              closedExits={closedExits}
              interactionMode={interactionMode}
              lang={lang}
              onSelectStart={handleSelectStart}
              onSetInteractionMode={setInteractionMode}
              onToggleNodeBlock={handleToggleNodeBlock}
              onToggleEdgeBlock={handleToggleEdgeBlock}
              onToggleExitClose={handleToggleExitClose}
              onResetToInitialState={handleResetToInitialState}
              onClearAllHazards={handleClearAllHazards}
            />
          </div>
        </div>
      </main>

      {/* Floating Momentary Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700/80 shadow-2xl rounded-xl px-4 py-3 text-xs font-semibold text-slate-200 flex items-center gap-2.5 backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* JSON Import & Schema Validation Modal */}
      <FileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onLoadData={handleLoadNewBuildingData}
        currentData={buildingData}
        lang={lang}
      />

      {/* Help & Algorithm Guide Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
