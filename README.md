# Smart Escape · Interactive Evacuation Route Simulator

**Smart Escape** is a production-grade, interactive emergency evacuation route simulator built with React, TypeScript, Tailwind CSS, and SVG visualization. It models facility floorplans as undirected graphs and computes optimal evacuation paths in real time using a strict Dijkstra shortest-path algorithm with deterministic tie-breaking and dynamic hazard toggling.

---

## 🚀 Key Features

- **Interactive Dynamic Floorplan (SVG)**:
  - Visual distinction for **Rooms** (rounded squares), **Corridor Junctions** (circular hubs), and **Emergency Exits** (hexagonal shields).
  - Clear integer cost badges rendered directly on every corridor.
  - Radiant glowing pulse animation for the active evacuation route.
  - Visual indicators for blocked nodes (hazard stripes / flames), blocked corridors, and closed exits.

- **Real-Time Strict Dijkstra Algorithm**:
  - **Active Graph Construction**: Excludes blocked rooms, junctions, corridors, and sealed exits (closed exits cannot act as intermediate nodes or destinations).
  - **True Weight Sum**: Path weight is calculated strictly as the sum of integer edge costs (ignoring visual Euclidean distances).
  - **Deterministic Tie-Breaking**:
    - **Tie-Breaker 1**: If multiple reachable exits tie with the minimum total cost, the exit with the lexicographically smallest exit ID is chosen.
    - **Tie-Breaker 2**: If multiple shortest paths to that same exit tie in total cost, the path with the lexicographically smallest sequence of node IDs (compared node by node) is selected.

- **Dynamic Hazard Management**:
  - Mode switch between **Set Start Location** and **Toggle Hazards / Blocks**.
  - Direct map click interactions to toggle room/junction hazards, corridor blockages, and exit open/closed status.
  - Fast **Reset to Initial State** (restoring file defaults) and **Clear All Hazards**.

- **Exact Simulation Status & Mandatory Alerts**:
  - `"Starting location blocked"` / `"শুরু করার স্থানটি অবরুদ্ধ"`: Displayed when the evacuation origin itself is engulfed in hazards.
  - `"No route available"` / `"কোনো পথ পাওয়া যায়নি"`: Displayed when all open exits are cut off.
  - Step-by-step route breakdown (e.g. `R1 ➔ C1 ➔ C2 ➔ E1`) with total evacuation cost.

- **Bilingual Interface (English & Bangla)**:
  - Instant toggle switch (`[ EN | BN ]`) translating all UI text, status alerts, hazard controls, and modal dialogs.

- **File Import & Strict Schema Validation**:
  - `<input type="file" accept=".json">` uploader with drag-and-drop and live text validation.
  - Validates node count (2–60), edge count (1–150), unique case-sensitive IDs, positive integer costs, self-loop prevention, duplicate edge rejection, and referential integrity.
  - Pre-loaded with the **AI DevFest Test Facility** default benchmark and a multi-wing laboratory preset.

- **Retina PNG Snapshot Export**:
  - In-browser export of the floorplan SVG to a 2x high-resolution PNG image with timestamp and route metadata for submissions and reports.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Exporting**: Native HTML5 Canvas / Blob API

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/smart-escape.git
cd smart-escape

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
# Type check and build bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📋 JSON Input Schema Format

```json
{
  "building": "AI DevFest Test Facility",
  "nodes": [
    { "id": "R1", "label": "Room 1", "type": "room", "x": 100, "y": 100 },
    { "id": "C1", "label": "Junction C1", "type": "junction", "x": 250, "y": 100 },
    { "id": "E1", "label": "Exit E1", "type": "exit", "x": 550, "y": 100 }
  ],
  "edges": [
    { "id": "e_r1_c1", "from": "R1", "to": "C1", "cost": 2 },
    { "id": "e_c1_e1", "from": "C1", "to": "E1", "cost": 3 }
  ],
  "initial_state": {
    "blocked_nodes": [],
    "blocked_edges": [],
    "closed_exits": []
  }
}
```

---

## 📄 License

Apache-2.0 License.
