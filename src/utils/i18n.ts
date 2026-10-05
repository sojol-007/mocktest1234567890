import { Language } from '../types';

export interface Translations {
  appName: string;
  appSubtitle: string;
  currentBuilding: string;
  importJson: string;
  resetHazards: string;
  exportPng: string;
  presetDefault: string;
  presetComplex: string;
  modeSelectStart: string;
  modeToggleHazard: string;
  activeStart: string;
  targetExit: string;
  totalCost: string;
  evacuationPath: string;
  status: string;
  statusStartBlocked: string;
  statusNoRoute: string;
  statusRouteFound: string;
  statusStartBlockedDesc: string;
  statusNoRouteDesc: string;
  hazardsTitle: string;
  blockedNodes: string;
  blockedEdges: string;
  closedExits: string;
  noHazardsActive: string;
  clearAllHazards: string;
  room: string;
  junction: string;
  exit: string;
  legendTitle: string;
  legendNormalRoom: string;
  legendJunction: string;
  legendExitOpen: string;
  legendExitClosed: string;
  legendStartNode: string;
  legendOptimalPath: string;
  legendBlockedNode: string;
  legendBlockedCorridor: string;
  clickToSetStart: string;
  clickToToggleHazard: string;
  clickToToggleCorridor: string;
  clickToToggleExit: string;
  modalImportTitle: string;
  modalImportDesc: string;
  dropJsonHere: string;
  orBrowseFile: string;
  validationReport: string;
  validationPassed: string;
  validationFailed: string;
  downloadSampleJson: string;
  close: string;
  applyData: string;
  corridorCost: string;
  nodesCount: string;
  edgesCount: string;
  allExitsStatus: string;
  openReachable: string;
  openUnreachable: string;
  closedStatus: string;
  quickTourTip: string;
  tieBreakerRule1: string;
  tieBreakerRule2: string;
}

export const translations: Record<Language, Translations> = {
  EN: {
    appName: "Smart Escape",
    appSubtitle: "Interactive Evacuation Route Simulator",
    currentBuilding: "Current Facility",
    importJson: "Import JSON",
    resetHazards: "Reset Initial State",
    exportPng: "Export Snapshot",
    presetDefault: "DevFest Facility (Default)",
    presetComplex: "Science Labs (Multi-Wing)",
    modeSelectStart: "Set Start Location",
    modeToggleHazard: "Toggle Hazards / Blocks",
    activeStart: "Start Location",
    targetExit: "Target Exit",
    totalCost: "Total Path Cost",
    evacuationPath: "Evacuation Route Sequence",
    status: "Simulation Status",
    statusStartBlocked: "Starting location blocked",
    statusNoRoute: "No route available",
    statusRouteFound: "Safe evacuation route calculated",
    statusStartBlockedDesc: "The selected starting node is engulfed or blocked by hazards. Occupants cannot begin evacuation from this location.",
    statusNoRouteDesc: "All paths to available emergency exits are severed by blocked corridors, hazardous rooms, or closed exits.",
    hazardsTitle: "Hazard & Blockage Management",
    blockedNodes: "Blocked Rooms & Junctions",
    blockedEdges: "Blocked Corridors",
    closedExits: "Closed Emergency Exits",
    noHazardsActive: "No hazards currently active in building",
    clearAllHazards: "Clear All Hazards",
    room: "Room",
    junction: "Junction",
    exit: "Exit",
    legendTitle: "Map Legend",
    legendNormalRoom: "Room",
    legendJunction: "Corridor Junction",
    legendExitOpen: "Open Exit",
    legendExitClosed: "Closed Exit",
    legendStartNode: "Evacuation Origin",
    legendOptimalPath: "Optimal Path",
    legendBlockedNode: "Hazard / Blocked Node",
    legendBlockedCorridor: "Blocked Corridor",
    clickToSetStart: "Click room or junction to set evacuation start",
    clickToToggleHazard: "Click to toggle blocked / hazard state",
    clickToToggleCorridor: "Click corridor badge or line to toggle blockage",
    clickToToggleExit: "Click exit to toggle open / closed",
    modalImportTitle: "Import Building JSON Dataset",
    modalImportDesc: "Upload a validated JSON graph according to the Smart Escape schema (2-60 nodes, 1-150 edges).",
    dropJsonHere: "Drop .json file here",
    orBrowseFile: "Browse JSON File",
    validationReport: "Schema Validation Result",
    validationPassed: "Dataset is valid and ready to load",
    validationFailed: "Validation errors detected. Please fix the file before applying.",
    downloadSampleJson: "Download Sample building.json",
    close: "Close",
    applyData: "Load into Simulator",
    corridorCost: "Cost",
    nodesCount: "Nodes",
    edgesCount: "Corridors",
    allExitsStatus: "Emergency Exits Overview",
    openReachable: "Open & Reachable",
    openUnreachable: "Unreachable",
    closedStatus: "Closed / Sealed",
    quickTourTip: "Tip: Toggle between 'Set Start' and 'Toggle Hazards' or click any corridor to simulate real-time emergency rerouting.",
    tieBreakerRule1: "Tie-Breaker 1: If costs tie, exit with smallest ID wins.",
    tieBreakerRule2: "Tie-Breaker 2: If path costs tie, lexicographically smallest node ID sequence wins."
  },
  BN: {
    appName: "স্মার্ট এস্কেপ",
    appSubtitle: "ইন্টারেক্টিভ উদ্ধার পথ সিমুলেটর",
    currentBuilding: "বর্তমান ভবন",
    importJson: "JSON ইমপোর্ট",
    resetHazards: "প্রাথমিক অবস্থায় রিসেট",
    exportPng: "স্ন্যাপশট এক্সপোর্ট",
    presetDefault: "ডেভফেস্ট ভবন (ডিফল্ট)",
    presetComplex: "বিজ্ঞান ল্যাব (মাল্টি-উইং)",
    modeSelectStart: "শুরুর স্থান নির্ধারণ",
    modeToggleHazard: "বিপদ / প্রতিবন্ধকতা টগল",
    activeStart: "শুরুর অবস্থান",
    targetExit: "লক্ষ্য প্রস্থান",
    totalCost: "মোট পথ ব্যয় (কস্ট)",
    evacuationPath: "উদ্ধার পথের ক্রম",
    status: "সিমুলেশন অবস্থা",
    statusStartBlocked: "শুরু করার স্থানটি অবরুদ্ধ",
    statusNoRoute: "কোনো পথ পাওয়া যায়নি",
    statusRouteFound: "নিরাপদ উদ্ধার পথ নির্ণয় করা হয়েছে",
    statusStartBlockedDesc: "নির্বাচিত শুরুর স্থানটিতে আগুন বা বিপদ থাকায় এটি সম্পূর্ণ অবরুদ্ধ। এখান থেকে উদ্ধার কার্যক্রম শুরু করা সম্ভব নয়।",
    statusNoRouteDesc: "করিডোর বা রুমে বাধার কারণে কোনো উন্মুক্ত জরুরি প্রস্থানে পৌঁছানোর পথ অবশিষ্ট নেই।",
    hazardsTitle: "বিপদ ও প্রতিবন্ধকতা নিয়ন্ত্রণ",
    blockedNodes: "অবরুদ্ধ কক্ষ ও সংযোগস্থল",
    blockedEdges: "অবরুদ্ধ করিডোরসমূহ",
    closedExits: "বন্ধ জরুরি প্রস্থানসমূহ",
    noHazardsActive: "ভবনে বর্তমানে কোনো সক্রিয় বিপদ বা প্রতিবন্ধকতা নেই",
    clearAllHazards: "সকল বিপদ মুছে ফেলুন",
    room: "কক্ষ",
    junction: "সংযোগস্থল",
    exit: "প্রস্থান",
    legendTitle: "মানচিত্রের নির্দেশিকা",
    legendNormalRoom: "কক্ষ",
    legendJunction: "করিডোর সংযোগস্থল",
    legendExitOpen: "উন্মুক্ত প্রস্থান",
    legendExitClosed: "বন্ধ প্রস্থান",
    legendStartNode: "উদ্ধার শুরুর নোড",
    legendOptimalPath: "সর্বোত্তম উদ্ধার পথ",
    legendBlockedNode: "বিপদ / অবরুদ্ধ নোড",
    legendBlockedCorridor: "অবরুদ্ধ করিডোর",
    clickToSetStart: "উদ্ধার শুরুর স্থান নির্ধারণ করতে ক্লিক করুন",
    clickToToggleHazard: "বিপদ / অবরুদ্ধ করতে ক্লিক করুন",
    clickToToggleCorridor: "করিডোরে প্রতিবন্ধকতা টগল করতে ক্লিক করুন",
    clickToToggleExit: "প্রস্থান খোলা বা বন্ধ করতে ক্লিক করুন",
    modalImportTitle: "ভবনের JSON ডেটাসেট ইমপোর্ট করুন",
    modalImportDesc: "স্মার্ট এস্কেপ স্কিমা অনুযায়ী ভ্যালিডেটেড JSON গ্রাফ আপলোড করুন (২-৬০ নোড, ১-১৫০ করিডোর)।",
    dropJsonHere: ".json ফাইলটি এখানে ফেলুন",
    orBrowseFile: "JSON ফাইল ব্রাউজ করুন",
    validationReport: "স্কিমা যাচাইকরণ ফলাফল",
    validationPassed: "ডেটাসেটটি সম্পূর্ণ বৈধ ও প্রস্তুত",
    validationFailed: "ফাইলে ত্রুটি পাওয়া গেছে। অনুগ্রহ করে সংশোধন করুন।",
    downloadSampleJson: "নমুনা building.json ডাউনলোড করুন",
    close: "বন্ধ করুন",
    applyData: "সিমুলেটরে লোড করুন",
    corridorCost: "কস্ট",
    nodesCount: "নোড সংখ্যা",
    edgesCount: "করিডোর সংখ্যা",
    allExitsStatus: "জরুরি প্রস্থানসমূহের অবস্থা",
    openReachable: "উন্মুক্ত ও গমনযোগ্য",
    openUnreachable: "অগম্য",
    closedStatus: "সিলগালা / বন্ধ",
    quickTourTip: "পরামর্শ: 'শুরুর স্থান নির্ধারণ' ও 'বিপদ টগল' মোড পরিবর্তন করে বা যেকোনো করিডোরে ক্লিক করে তাৎক্ষণিক পথ পরিবর্তনের সিমুলেশন দেখুন।",
    tieBreakerRule1: "টাই-ব্রেকার ১: কস্ট সমান হলে ক্ষুদ্রতম আইডি যুক্ত প্রস্থান বিজয়ী হবে।",
    tieBreakerRule2: "টাই-ব্রেকার ২: পথ কস্ট সমান হলে লেক্সিকোগ্রাফিক ক্ষুদ্রতম নোড ক্রম বিজয়ী হবে।"
  }
};
