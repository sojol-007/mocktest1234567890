import React, { useState, useMemo } from 'react';
import { BuildingData, DijkstraPathResult, InteractionMode, Language, BuildingNode, BuildingEdge } from '../types';
import { translations } from '../utils/i18n';
import { Flame, ShieldAlert, Footprints, AlertTriangle, ArrowRight, Ban, CheckCircle2 } from 'lucide-react';

interface MapViewerProps {
  buildingData: BuildingData;
  startNodeId: string;
  blockedNodes: Set<string>;
  blockedEdges: Set<string>;
  closedExits: Set<string>;
  routeResult: DijkstraPathResult;
  interactionMode: InteractionMode;
  lang: Language;
  onSelectStart: (nodeId: string) => void;
  onToggleNodeBlock: (nodeId: string) => void;
  onToggleEdgeBlock: (edgeId: string) => void;
  onToggleExitClose: (exitId: string) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  buildingData,
  startNodeId,
  blockedNodes,
  blockedEdges,
  closedExits,
  routeResult,
  interactionMode,
  lang,
  onSelectStart,
  onToggleNodeBlock,
  onToggleEdgeBlock,
  onToggleExitClose,
  svgRef
}) => {
  const t = translations[lang];
  const [hoveredNode, setHoveredNode] = useState<BuildingNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<BuildingEdge | null>(null);

  // Set of edge IDs that are part of the optimal path
  const pathEdgeSet = useMemo(() => new Set(routeResult.edgePath), [routeResult.edgePath]);
  // Set of node IDs that are part of the optimal path
  const pathNodeSet = useMemo(() => new Set(routeResult.nodePath), [routeResult.nodePath]);

  // Map of nodes by ID for fast coordinate lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, BuildingNode>();
    for (const n of buildingData.nodes) {
      map.set(n.id, n);
    }
    return map;
  }, [buildingData.nodes]);

  // Calculate dynamic bounding box for SVG viewBox
  const viewBox = useMemo(() => {
    if (buildingData.nodes.length === 0) return "0 0 800 600";
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of buildingData.nodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    }
    const padding = 80;
    const width = Math.max(maxX - minX + padding * 2, 500);
    const height = Math.max(maxY - minY + padding * 2, 400);
    return `${minX - padding} ${minY - padding} ${width} ${height}`;
  }, [buildingData.nodes]);

  // Handle click on node based on mode and node type
  const handleNodeClick = (node: BuildingNode) => {
    if (node.type === 'exit') {
      onToggleExitClose(node.id);
      return;
    }

    if (interactionMode === 'start') {
      onSelectStart(node.id);
    } else {
      onToggleNodeBlock(node.id);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl select-none">
      {/* Interactive Map Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{buildingData.building}</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-3">
            <span>{t.nodesCount}: <strong className="text-slate-200">{buildingData.nodes.length}</strong></span>
            <span>{t.edgesCount}: <strong className="text-slate-200">{buildingData.edges.length}</strong></span>
          </div>
        </div>

        {/* Current Click Action Mode Hint */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">
            {interactionMode === 'start' ? t.clickToSetStart : t.clickToToggleHazard}
          </span>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative flex-1 min-h-[460px] w-full flex items-center justify-center p-2 overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full max-h-[720px] transition-all duration-300"
          style={{ cursor: interactionMode === 'start' ? 'crosshair' : 'pointer' }}
        >
          <defs>
            {/* Glow Filter for Active Route */}
            <filter id="glow-route" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pulsing Start Filter */}
            <filter id="glow-start" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Pattern for Hazard / Blocked Nodes */}
            <pattern id="hazard-stripe" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#ef4444" strokeWidth="3" opacity="0.6" />
              <line x1="4" y1="0" x2="4" y2="8" stroke="#7f1d1d" strokeWidth="3" opacity="0.4" />
            </pattern>
          </defs>

          {/* 1. EDGES / CORRIDORS LAYER */}
          <g id="edges-layer">
            {buildingData.edges.map(edge => {
              const fromNode = nodeMap.get(edge.from);
              const toNode = nodeMap.get(edge.to);
              if (!fromNode || !toNode) return null;

              const isBlocked = blockedEdges.has(edge.id);
              const isPath = pathEdgeSet.has(edge.id);
              const isConnectedToBlockedNode = blockedNodes.has(edge.from) || blockedNodes.has(edge.to) ||
                closedExits.has(edge.from) || closedExits.has(edge.to);

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              // Calculate angle for text alignment if desired
              const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * (180 / Math.PI);
              const isHovered = hoveredEdge?.id === edge.id;

              return (
                <g
                  key={edge.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleEdgeBlock(edge.id);
                  }}
                  onMouseEnter={() => setHoveredEdge(edge)}
                  onMouseLeave={() => setHoveredEdge(null)}
                >
                  {/* Invisible wide hit area for easy clicking */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="transparent"
                    strokeWidth="28"
                  />

                  {/* Base Edge Line */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={
                      isBlocked
                        ? '#ef4444'
                        : isConnectedToBlockedNode
                        ? '#475569'
                        : isPath
                        ? '#059669'
                        : '#334155'
                    }
                    strokeWidth={isPath ? '6' : isBlocked ? '4' : '3'}
                    strokeDasharray={isBlocked ? '6 6' : isConnectedToBlockedNode ? '4 4' : undefined}
                    strokeLinecap="round"
                    className="transition-colors duration-200"
                  />

                  {/* Radiant Animated Glow Path */}
                  {isPath && !isBlocked && (
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#34d399"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray="10 6"
                      filter="url(#glow-route)"
                      className="animate-pulse"
                      opacity="0.9"
                    />
                  )}

                  {/* Blocked Cross Overlay */}
                  {isBlocked && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <circle r="11" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                      <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                      <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )}

                  {/* Numeric Cost Badge (Clickable) */}
                  {!isBlocked && (
                    <g
                      transform={`translate(${midX}, ${midY})`}
                      className="transition-transform duration-150 hover:scale-110"
                    >
                      <rect
                        x="-14"
                        y="-10"
                        width="28"
                        height="20"
                        rx="5"
                        fill={isPath ? '#065f46' : isHovered ? '#1e293b' : '#0f172a'}
                        stroke={isPath ? '#34d399' : isHovered ? '#38bdf8' : '#475569'}
                        strokeWidth={isPath ? '1.5' : '1'}
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={isPath ? '#6ee7b7' : isHovered ? '#f8fafc' : '#94a3b8'}
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="system-ui, sans-serif"
                      >
                        {edge.cost}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. NODES LAYER */}
          <g id="nodes-layer">
            {buildingData.nodes.map(node => {
              const isStart = node.id === startNodeId;
              const isBlocked = blockedNodes.has(node.id);
              const isClosed = closedExits.has(node.id);
              const isPath = pathNodeSet.has(node.id);
              const isTargetExit = routeResult.targetExitId === node.id;
              const isHovered = hoveredNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Start Node Radiant Outer Rings */}
                  {isStart && (
                    <>
                      <circle
                        r="34"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        opacity="0.7"
                        className="animate-spin"
                        style={{ animationDuration: '9s' }}
                      />
                      <circle
                        r="28"
                        fill="#0284c7"
                        opacity="0.2"
                        className="animate-ping"
                      />
                    </>
                  )}

                  {/* Optimal Path Outer Aura */}
                  {isPath && !isStart && !isTargetExit && (
                    <circle
                      r="26"
                      fill="#10b981"
                      opacity="0.15"
                      className="animate-pulse"
                    />
                  )}

                  {/* Target Exit Radiant Glow */}
                  {isTargetExit && (
                    <>
                      <circle
                        r="34"
                        fill="#10b981"
                        opacity="0.3"
                        className="animate-ping"
                      />
                      <circle
                        r="30"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="2.5"
                        filter="url(#glow-route)"
                      />
                    </>
                  )}

                  {/* NODE SHAPES: Room (Rounded Square), Junction (Circle), Exit (Shield/Badge) */}

                  {/* ROOM SHAPE */}
                  {node.type === 'room' && (
                    <g>
                      <rect
                        x="-20"
                        y="-20"
                        width="40"
                        height="40"
                        rx="8"
                        fill={
                          isBlocked
                            ? 'url(#hazard-stripe)'
                            : isStart
                            ? '#0369a1'
                            : isPath
                            ? '#064e3b'
                            : '#1e293b'
                        }
                        stroke={
                          isBlocked
                            ? '#ef4444'
                            : isStart
                            ? '#38bdf8'
                            : isPath
                            ? '#10b981'
                            : isHovered
                            ? '#94a3b8'
                            : '#475569'
                        }
                        strokeWidth={isStart || isPath || isBlocked ? '2.5' : '1.5'}
                        className="transition-all duration-200"
                      />
                      {/* Room Interior Icon / Label */}
                      {isBlocked ? (
                        <g transform="translate(-8, -8) scale(0.65)">
                          <Flame color="#ef4444" strokeWidth={2.5} />
                        </g>
                      ) : (
                        <text
                          x="0"
                          y="5"
                          textAnchor="middle"
                          fill={isStart ? '#e0f2fe' : isPath ? '#a7f3d0' : '#f1f5f9'}
                          fontSize="12"
                          fontWeight="700"
                        >
                          {node.id}
                        </text>
                      )}
                    </g>
                  )}

                  {/* JUNCTION SHAPE */}
                  {node.type === 'junction' && (
                    <g>
                      <circle
                        r="18"
                        fill={
                          isBlocked
                            ? 'url(#hazard-stripe)'
                            : isStart
                            ? '#0369a1'
                            : isPath
                            ? '#065f46'
                            : '#0f172a'
                        }
                        stroke={
                          isBlocked
                            ? '#ef4444'
                            : isStart
                            ? '#38bdf8'
                            : isPath
                            ? '#34d399'
                            : isHovered
                            ? '#cbd5e1'
                            : '#64748b'
                        }
                        strokeWidth={isStart || isPath || isBlocked ? '2.5' : '1.5'}
                        className="transition-all duration-200"
                      />
                      {isBlocked ? (
                        <g transform="translate(-7, -7) scale(0.6)">
                          <Flame color="#f87171" strokeWidth={2.5} />
                        </g>
                      ) : (
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill={isStart ? '#bae6fd' : isPath ? '#a7f3d0' : '#94a3b8'}
                          fontSize="11"
                          fontWeight="700"
                        >
                          {node.id}
                        </text>
                      )}
                    </g>
                  )}

                  {/* EXIT SHAPE */}
                  {node.type === 'exit' && (
                    <g>
                      {/* Hexagonal / Shield Exit Badge */}
                      <polygon
                        points="0,-22 20,-11 20,11 0,22 -20,11 -20,-11"
                        fill={
                          isClosed
                            ? '#450a0a'
                            : isTargetExit
                            ? '#064e3b'
                            : '#065f46'
                        }
                        stroke={
                          isClosed
                            ? '#ef4444'
                            : isTargetExit
                            ? '#34d399'
                            : '#10b981'
                        }
                        strokeWidth={isTargetExit ? '3' : '2'}
                        className="transition-all duration-200"
                      />
                      {isClosed ? (
                        <g transform="translate(-7, -7) scale(0.6)">
                          <Ban color="#fca5a5" strokeWidth={2.5} />
                        </g>
                      ) : (
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill={isTargetExit ? '#6ee7b7' : '#d1fae5'}
                          fontSize="11"
                          fontWeight="800"
                        >
                          {node.id}
                        </text>
                      )}
                    </g>
                  )}

                  {/* Node Label Below */}
                  <text
                    x="0"
                    y="32"
                    textAnchor="middle"
                    fill={
                      isBlocked || isClosed
                        ? '#f87171'
                        : isStart
                        ? '#38bdf8'
                        : isTargetExit
                        ? '#34d399'
                        : '#94a3b8'
                    }
                    fontSize="11"
                    fontWeight={isStart || isTargetExit ? '700' : '500'}
                    className="pointer-events-none select-none drop-shadow"
                  >
                    {node.label}
                  </text>

                  {/* Start Location Tag Badge */}
                  {isStart && (
                    <g transform="translate(0, -30)">
                      <rect
                        x="-26"
                        y="-10"
                        width="52"
                        height="18"
                        rx="4"
                        fill="#0284c7"
                        stroke="#38bdf8"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="800"
                        letterSpacing="0.5"
                      >
                        START
                      </text>
                    </g>
                  )}

                  {/* Target Exit Tag Badge */}
                  {isTargetExit && (
                    <g transform="translate(0, -32)">
                      <rect
                        x="-28"
                        y="-10"
                        width="56"
                        height="18"
                        rx="4"
                        fill="#059669"
                        stroke="#34d399"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="800"
                        letterSpacing="0.5"
                      >
                        TARGET
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Inspector Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur z-20 max-w-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  hoveredNode.type === 'exit' ? 'bg-emerald-400' : hoveredNode.type === 'room' ? 'bg-blue-400' : 'bg-slate-400'
                }`}></span>
                {hoveredNode.id}: {hoveredNode.label}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {hoveredNode.type}
              </span>
            </div>
            <div className="text-slate-400 text-[11px] space-y-0.5">
              <div>Coordinates: ({hoveredNode.x}, {hoveredNode.y})</div>
              {hoveredNode.id === startNodeId && (
                <div className="text-sky-400 font-semibold">{t.activeStart}</div>
              )}
              {blockedNodes.has(hoveredNode.id) && (
                <div className="text-red-400 font-semibold">{t.legendBlockedNode}</div>
              )}
              {closedExits.has(hoveredNode.id) && (
                <div className="text-red-400 font-semibold">{t.legendExitClosed}</div>
              )}
              <div className="text-slate-500 pt-1 text-[10px]">
                {hoveredNode.type === 'exit'
                  ? t.clickToToggleExit
                  : interactionMode === 'start'
                  ? t.clickToSetStart
                  : t.clickToToggleHazard}
              </div>
            </div>
          </div>
        )}

        {/* Hover Edge Tooltip */}
        {hoveredEdge && (
          <div className="absolute bottom-3 right-3 bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur z-20 animate-in fade-in duration-150">
            <div className="font-bold text-slate-100 mb-1 flex items-center gap-2">
              <span>Corridor: {hoveredEdge.from} ⟷ {hoveredEdge.to}</span>
              <span className="text-emerald-400 font-mono text-[11px]">{t.corridorCost}: {hoveredEdge.cost}</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              ID: {hoveredEdge.id} | Status: {blockedEdges.has(hoveredEdge.id) ? 'Blocked' : 'Active'}
            </div>
            <div className="text-slate-500 pt-1 text-[10px]">{t.clickToToggleCorridor}</div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/95 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-300">{t.legendTitle}:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-500"></div>
            <span>{t.legendNormalRoom}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-400"></div>
            <span>{t.legendJunction}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rotate-45 bg-emerald-900 border border-emerald-400"></div>
            <span>{t.legendExitOpen}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rotate-45 bg-red-950 border border-red-500"></div>
            <span>{t.legendExitClosed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-sky-500 border border-sky-300 animate-pulse"></div>
            <span>{t.legendStartNode}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-1.5 bg-emerald-400 rounded-full"></div>
            <span>{t.legendOptimalPath}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-red-950 border border-red-500 flex items-center justify-center">
              <span className="text-[9px] text-red-400 font-bold">✕</span>
            </div>
            <span>{t.legendBlockedNode}</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 italic hidden md:block">
          {t.quickTourTip}
        </div>
      </div>
    </div>
  );
};
