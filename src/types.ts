export type NodeType = 'room' | 'junction' | 'exit';

export interface BuildingNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

export interface BuildingEdge {
  id: string;
  from: string;
  to: string;
  cost: number;
}

export interface InitialState {
  blocked_nodes: string[];
  blocked_edges: string[];
  closed_exits: string[];
}

export interface BuildingData {
  building: string;
  nodes: BuildingNode[];
  edges: BuildingEdge[];
  initial_state: InitialState;
}

export interface ValidationIssue {
  field?: string;
  en: string;
  bn: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export type RoutingStatus = 'OK' | 'START_BLOCKED' | 'NO_ROUTE';

export interface DijkstraPathResult {
  status: RoutingStatus;
  statusMessageEn: string;
  statusMessageBn: string;
  startNodeId: string;
  targetExitId: string | null;
  totalCost: number | null;
  nodePath: string[];
  edgePath: string[];
  allExitCosts: {
    exitId: string;
    label: string;
    cost: number | null;
    isClosed: boolean;
    isReachable: boolean;
  }[];
}

export type Language = 'EN' | 'BN';

export type InteractionMode = 'start' | 'hazard';
