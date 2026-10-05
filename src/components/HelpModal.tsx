import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/i18n';
import { X, CheckCircle, Shield, AlertTriangle, Scale, Route } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, lang }) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-600/40 text-emerald-400">
              <Route className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-100">
              {lang === 'EN' ? 'Smart Escape · Routing Rules & Guide' : 'স্মার্ট এস্কেপ · অ্যালগরিদম নিয়ম ও নির্দেশিকা'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Section 1: Active Graph */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-sky-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>{lang === 'EN' ? '1. Active Graph Construction' : '১. সক্রিয় গ্রাফ গঠন'}</span>
            </h3>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
              <li>
                <strong>{lang === 'EN' ? 'Blocked Nodes:' : 'অবরুদ্ধ নোড:'}</strong>{' '}
                {lang === 'EN'
                  ? 'Excluded from routing along with all corridors connected to them.'
                  : 'অবরুদ্ধ নোড এবং এর সাথে যুক্ত সকল করিডোর সম্পূর্ণ বাদ দেওয়া হয়।'}
              </li>
              <li>
                <strong>{lang === 'EN' ? 'Blocked Edges:' : 'অবরুদ্ধ করিডোর:'}</strong>{' '}
                {lang === 'EN'
                  ? 'Corridors marked as blocked cannot be traversed.'
                  : 'অবরুদ্ধ করিডোর দিয়ে কোনো চলাচল সম্ভব নয়।'}
              </li>
              <li>
                <strong>{lang === 'EN' ? 'Closed Exits:' : 'বন্ধ প্রস্থান:'}</strong>{' '}
                {lang === 'EN'
                  ? 'Closed emergency exits cannot act as final destinations or intermediate nodes.'
                  : 'সিলগালা বা বন্ধ জরুরি প্রস্থান গন্তব্য বা মধ্যবর্তী নোড হিসেবে ব্যবহৃত হতে পারবে না।'}
              </li>
            </ul>
          </div>

          {/* Section 2: Path Weight */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'EN' ? '2. Path Weight Definition' : '২. পথের মোট ব্যয় (কস্ট)'}</span>
            </h3>
            <p>
              {lang === 'EN'
                ? 'Total route cost is strictly the sum of integer "cost" attributes on traversed edges. Visual Euclidean spatial distances on canvas/SVG coordinates are NOT used for pathfinding.'
                : 'পথের মোট ব্যয় কেবলমাত্র করিডোরে নির্ধারিত পূর্ণসংখ্যা "cost"-এর যোগফল। ক্যানভাস বা মানচিত্রের দৃশ্যমান দূরত্ব (Euclidean Distance) হিসাব করা হয় না।'}
            </p>
          </div>

          {/* Section 3: Tie-Breakers */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>{lang === 'EN' ? '3. Strict Tie-Breaking Strategy' : '৩. টাই-ব্রেকিং নিয়মাবলী'}</span>
            </h3>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
              <li>
                <strong>{lang === 'EN' ? 'Tie-Breaker 1 (Exits):' : 'টাই-ব্রেকার ১ (প্রস্থান):'}</strong>{' '}
                {lang === 'EN'
                  ? 'If multiple reachable exits tie with the minimum total cost, the exit with the lexicographically smallest exit ID is selected (e.g. E1 before E2).'
                  : 'যদি একাধিক উন্মুক্ত প্রস্থানে সর্বনিম্ন কস্ট সমান হয়, তবে লেক্সিকোগ্রাফিক ক্ষুদ্রতম আইডি যুক্ত প্রস্থানটি বিজয়ী হবে (যেমন: E1 আগে E2-এর চেয়ে)।'}
              </li>
              <li>
                <strong>{lang === 'EN' ? 'Tie-Breaker 2 (Paths):' : 'টাই-ব্রেকার ২ (পথ ক্রম):'}</strong>{' '}
                {lang === 'EN'
                  ? 'If multiple distinct shortest paths lead to that same exit with equal cost, the path with the lexicographically smallest sequence of node IDs (compared element by element) is selected.'
                  : 'যদি একই প্রস্থানে সমান ব্যয়ে পৌঁছানোর একাধিক পথ থাকে, তবে নোড-বাই-নোড লেক্সিকোগ্রাফিক ক্ষুদ্রতম নোড ক্রমের পথটি বিজয়ী হবে।'}
              </li>
            </ul>
          </div>

          {/* Section 4: Required Status States */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{lang === 'EN' ? '4. Mandatory Error & Status States' : '৪. নির্ধারিত ত্রুটি ও অবস্থা বার্তা'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-red-950/50 border border-red-800/60">
                <div className="font-bold text-red-300">"Starting location blocked" / "শুরু করার স্থানটি অবরুদ্ধ"</div>
                <div className="text-slate-400 mt-1">
                  {lang === 'EN'
                    ? 'Triggered when the origin room or junction is engulfed in hazards.'
                    : 'শুরুর রুমে বা সংযোগস্থলে বিপদ থাকলে প্রদর্শিত হয়।'}
                </div>
              </div>
              <div className="p-2.5 rounded bg-amber-950/50 border border-amber-800/60">
                <div className="font-bold text-amber-300">"No route available" / "কোনো পথ পাওয়া যায়নি"</div>
                <div className="text-slate-400 mt-1">
                  {lang === 'EN'
                    ? 'Triggered when all paths to all open exits are cut off.'
                    : 'কোনো উন্মুক্ত প্রস্থানে পৌঁছানোর পথ না থাকলে প্রদর্শিত হয়।'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
