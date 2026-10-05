import { BuildingData } from '../types';

export const DEFAULT_BUILDING: BuildingData = {
  building: "AI DevFest Test Facility",
  nodes: [
    { id: "R1", label: "Room 1", type: "room", x: 100, y: 100 },
    { id: "R2", label: "Room 2", type: "room", x: 100, y: 300 },
    { id: "C1", label: "Junction C1", type: "junction", x: 250, y: 100 },
    { id: "C2", label: "Junction C2", type: "junction", x: 400, y: 100 },
    { id: "C3", label: "Junction C3", type: "junction", x: 250, y: 300 },
    { id: "C4", label: "Junction C4", type: "junction", x: 400, y: 300 },
    { id: "E1", label: "Exit E1", type: "exit", x: 550, y: 100 },
    { id: "E2", label: "Exit E2", type: "exit", x: 550, y: 300 }
  ],
  edges: [
    { id: "e_r1_c1", from: "R1", to: "C1", cost: 2 },
    { id: "e_c1_c2", from: "C1", to: "C2", cost: 3 },
    { id: "e_c2_e1", from: "C2", to: "E1", cost: 2 },
    { id: "e_r2_c3", from: "R2", to: "C3", cost: 2 },
    { id: "e_c1_c3", from: "C1", to: "C3", cost: 4 },
    { id: "e_c3_c4", from: "C3", to: "C4", cost: 3 },
    { id: "e_c2_c4", from: "C2", to: "C4", cost: 5 },
    { id: "e_c4_e2", from: "C4", to: "E2", cost: 2 }
  ],
  initial_state: {
    blocked_nodes: [],
    blocked_edges: [],
    closed_exits: []
  }
};

export const PRESET_COMPLEX_CAMPUS: BuildingData = {
  building: "Metro Science Center & Labs",
  nodes: [
    { id: "Lab1", label: "Biology Lab", type: "room", x: 80, y: 80 },
    { id: "Lab2", label: "Chemistry Lab", type: "room", x: 80, y: 240 },
    { id: "Office1", label: "Staff Office A", type: "room", x: 80, y: 400 },
    { id: "HallA", label: "Hallway North", type: "junction", x: 240, y: 80 },
    { id: "HallB", label: "Central Atrium", type: "junction", x: 240, y: 240 },
    { id: "HallC", label: "Hallway South", type: "junction", x: 240, y: 400 },
    { id: "StairN", label: "North Stairwell", type: "junction", x: 420, y: 80 },
    { id: "StairS", label: "South Stairwell", type: "junction", x: 420, y: 400 },
    { id: "EastHub", label: "East Wing Hub", type: "junction", x: 420, y: 240 },
    { id: "Auditorium", label: "Auditorium", type: "room", x: 580, y: 240 },
    { id: "Exit_North", label: "Emergency Exit North", type: "exit", x: 580, y: 80 },
    { id: "Exit_South", label: "Emergency Exit South", type: "exit", x: 580, y: 400 }
  ],
  edges: [
    { id: "e_l1_ha", from: "Lab1", to: "HallA", cost: 3 },
    { id: "e_l2_hb", from: "Lab2", to: "HallB", cost: 2 },
    { id: "e_o1_hc", from: "Office1", to: "HallC", cost: 3 },
    { id: "e_ha_hb", from: "HallA", to: "HallB", cost: 4 },
    { id: "e_hb_hc", from: "HallB", to: "HallC", cost: 4 },
    { id: "e_ha_sn", from: "HallA", to: "StairN", cost: 5 },
    { id: "e_hb_eh", from: "HallB", to: "EastHub", cost: 4 },
    { id: "e_hc_ss", from: "HallC", to: "StairS", cost: 5 },
    { id: "e_sn_eh", from: "StairN", to: "EastHub", cost: 3 },
    { id: "e_ss_eh", from: "StairS", to: "EastHub", cost: 3 },
    { id: "e_sn_en", from: "StairN", to: "Exit_North", cost: 2 },
    { id: "e_ss_es", from: "StairS", to: "Exit_South", cost: 2 },
    { id: "e_eh_aud", from: "EastHub", to: "Auditorium", cost: 3 },
    { id: "e_aud_en", from: "Auditorium", to: "Exit_North", cost: 4 },
    { id: "e_aud_es", from: "Auditorium", to: "Exit_South", cost: 4 }
  ],
  initial_state: {
    blocked_nodes: [],
    blocked_edges: [],
    closed_exits: []
  }
};
