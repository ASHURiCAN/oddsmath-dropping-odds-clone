'use client';

import React, { useState, useMemo, useEffect } from 'react';

// Types
interface Odds {
  one: number;
  x: number;
  two: number;
}

interface HistoryPoint {
  ts: string;
  one: number;
  x: number;
  two: number;
}

interface Match {
  id: number;
  kickoff: string;
  day: 'today' | 'tomorrow';
  league: string;
  home: string;
  away: string;
  bookmaker: string;
  opening: Odds;
  current: Odds;
  margin: number;
  dropPercent: number;
  dropSide: '1' | 'X' | '2' | 'none';
  history: HistoryPoint[];
}

// Mock realistic data
const initialMatches: Match[] = [
  {
    id: 1, kickoff: "20:45", day: "today", league: "Premier League",
    home: "Manchester City", away: "Arsenal", bookmaker: "Pinnacle",
    opening: { one: 1.82, x: 3.65, two: 4.10 }, current: { one: 1.67, x: 3.85, two: 4.55 },
    margin: 2.7, dropPercent: 8.2, dropSide: "1",
    history: [
      { ts: "Ouverture", one: 1.82, x: 3.65, two: 4.10 },
      { ts: "-4h", one: 1.80, x: 3.70, two: 4.20 },
      { ts: "-2h", one: 1.75, x: 3.78, two: 4.35 },
      { ts: "-1h", one: 1.70, x: 3.82, two: 4.48 },
      { ts: "Actuel", one: 1.67, x: 3.85, two: 4.55 },
    ],
  },
  {
    id: 2, kickoff: "18:30", day: "today", league: "La Liga",
    home: "Real Madrid", away: "Barcelona", bookmaker: "SBOBET",
    opening: { one: 2.05, x: 3.40, two: 3.55 }, current: { one: 2.15, x: 3.25, two: 3.35 },
    margin: 3.1, dropPercent: 5.9, dropSide: "X",
    history: [
      { ts: "Ouverture", one: 2.05, x: 3.40, two: 3.55 },
      { ts: "-3h", one: 2.08, x: 3.38, two: 3.50 },
      { ts: "-90min", one: 2.12, x: 3.30, two: 3.42 },
      { ts: "Actuel", one: 2.15, x: 3.25, two: 3.35 },
    ],
  },
  {
    id: 3, kickoff: "21:00", day: "today", league: "Serie A",
    home: "Inter Milan", away: "AC Milan", bookmaker: "Pinnacle",
    opening: { one: 1.95, x: 3.30, two: 4.00 }, current: { one: 1.88, x: 3.45, two: 4.20 },
    margin: 2.9, dropPercent: 3.6, dropSide: "1",
    history: [
      { ts: "Ouverture", one: 1.95, x: 3.30, two: 4.00 },
      { ts: "-2h", one: 1.92, x: 3.35, two: 4.10 },
      { ts: "Actuel", one: 1.88, x: 3.45, two: 4.20 },
    ],
  },
  {
    id: 4, kickoff: "19:00", day: "today", league: "Bundesliga",
    home: "Bayern Munich", away: "Borussia Dortmund", bookmaker: "SBOBET",
    opening: { one: 1.55, x: 4.20, two: 5.80 }, current: { one: 1.48, x: 4.35, two: 6.10 },
    margin: 2.4, dropPercent: 4.5, dropSide: "1",
    history: [
      { ts: "Ouverture", one: 1.55, x: 4.20, two: 5.80 },
      { ts: "-5h", one: 1.58, x: 4.15, two: 5.65 },
      { ts: "-2h", one: 1.52, x: 4.25, two: 5.90 },
      { ts: "Actuel", one: 1.48, x: 4.35, two: 6.10 },
    ],
  },
  {
    id: 5, kickoff: "20:00", day: "tomorrow", league: "Ligue 1",
    home: "PSG", away: "Olympique Marseille", bookmaker: "Pinnacle",
    opening: { one: 1.38, x: 4.80, two: 7.50 }, current: { one: 1.35, x: 5.10, two: 8.20 },
    margin: 3.3, dropPercent: 2.2, dropSide: "1",
    history: [
      { ts: "Ouverture", one: 1.38, x: 4.80, two: 7.50 },
      { ts: "Actuel", one: 1.35, x: 5.10, two: 8.20 },
    ],
  },
  {
    id: 6, kickoff: "17:00", day: "today", league: "Eredivisie",
    home: "Ajax", away: "Feyenoord", bookmaker: "SBOBET",
    opening: { one: 2.25, x: 3.35, two: 3.10 }, current: { one: 2.45, x: 3.20, two: 2.95 },
    margin: 4.1, dropPercent: 7.1, dropSide: "2",
    history: [
      { ts: "Ouverture", one: 2.25, x: 3.35, two: 3.10 },
      { ts: "-3h", one: 2.30, x: 3.30, two: 3.05 },
      { ts: "-1h", one: 2.38, x: 3.25, two: 3.00 },
      { ts: "Actuel", one: 2.45, x: 3.20, two: 2.95 },
    ],
  },
  {
    id: 7, kickoff: "22:00", day: "today", league: "Premier League",
    home: "Liverpool", away: "Chelsea", bookmaker: "Pinnacle",
    opening: { one: 1.72, x: 3.80, two: 4.60 }, current: { one: 1.72, x: 3.80, two: 4.60 },
    margin: 2.6, dropPercent: 0, dropSide: "none",
    history: [
      { ts: "Ouverture", one: 1.72, x: 3.80, two: 4.60 },
      { ts: "Actuel", one: 1.72, x: 3.80, two: 4.60 },
    ],
  },
  {
    id: 8, kickoff: "15:30", day: "tomorrow", league: "Serie A",
    home: "Juventus", away: "Roma", bookmaker: "SBOBET",
    opening: { one: 1.90, x: 3.25, two: 4.35 }, current: { one: 1.82, x: 3.40, two: 4.60 },
    margin: 3.0, dropPercent: 4.2, dropSide: "1",
    history: [
      { ts: "Ouverture", one: 1.90, x: 3.25, two: 4.35 },
      { ts: "-4h", one: 1.88, x: 3.28, two: 4.40 },
      { ts: "Actuel", one: 1.82, x: 3.40, two: 4.60 },
    ],
  },
  {
    id: 9, kickoff: "19:45", day: "today", league: "Champions League",
    home: "Real Madrid", away: "Manchester United", bookmaker: "Pinnacle",
    opening: { one: 1.65, x: 3.90, two: 5.20 }, current: { one: 1.58, x: 4.05, two: 5.50 },
    margin: 2.5, dropPercent: 4.2, dropSide: "1",
    history: [
      { ts: "Ouverture", one: 1.65, x: 3.90, two: 5.20 },
      { ts: "-6h", one: 1.68, x: 3.85, two: 5.05 },
      { ts: "-2h", one: 1.62, x: 3.95, two: 5.30 },
      { ts: "Actuel", one: 1.58, x: 4.05, two: 5.50 },
    ],
  },
  {
    id: 10, kickoff: "21:30", day: "tomorrow", league: "Bundesliga",
    home: "RB Leipzig", away: "Bayer Leverkusen", bookmaker: "SBOBET",
    opening: { one: 2.40, x: 3.45, two: 2.85 }, current: { one: 2.55, x: 3.30, two: 2.70 },
    margin: 3.8, dropPercent: 5.3, dropSide: "2",
    history: [
      { ts: "Ouverture", one: 2.40, x: 3.45, two: 2.85 },
      { ts: "-2h", one: 2.48, x: 3.38, two: 2.78 },
      { ts: "Actuel", one: 2.55, x: 3.30, two: 2.70 },
    ],
  },
];

export default function DroppingOddsClone() {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [filterDate, setFilterDate] = useState<'today' | 'tomorrow' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minDrop, setMinDrop] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'dropPercent', dir: 'desc' });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: number; msg: string; time: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.value = 920;
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      gain.gain.value = 0.25;
      const dur = 0.18;
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, dur * 1000 + 50);
    } catch (e) {}
  };

  const addNotification = (msg: string) => {
    const id = Date.now();
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setNotifications((prev) => [{ id, msg, time }, ...prev].slice(0, 5));
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5800);
  };

  const simulateDrop = (specificId?: number) => {
    setMatches((prev) => {
      const newM = [...prev];
      let idx = -1;
      if (specificId) {
        idx = newM.findIndex((m) => m.id === specificId);
      } else {
        const cands = newM.filter((m) => m.day === 'today' && m.dropPercent < 11);
        if (cands.length === 0) return prev;
        idx = newM.findIndex((m) => m.id === cands[Math.floor(Math.random() * cands.length)].id);
      }
      if (idx === -1) return prev;

      const m = { ...newM[idx] };
      const sides: ('one' | 'x' | 'two')[] = ['one', 'x', 'two'];
      let side: 'one' | 'x' | 'two' = sides[Math.floor(Math.random() * 3)];
      if (m.dropSide !== 'none' && Math.random() > 0.45) {
        side = m.dropSide === '1' ? 'one' : m.dropSide === 'X' ? 'x' : 'two';
      }

      const oldV = m.current[side];
      const dec = parseFloat((0.05 + Math.random() * 0.11).toFixed(2));
      const newV = Math.max(1.35, parseFloat((oldV - dec).toFixed(2)));
      m.current = { ...m.current, [side]: newV };

      const calc = (o: number, c: number) => parseFloat((((o - c) / o) * 100).toFixed(1));
      const d1 = calc(m.opening.one, m.current.one);
      const dX = calc(m.opening.x, m.current.x);
      const d2 = calc(m.opening.two, m.current.two);
      const maxD = Math.max(d1, dX, d2);

      let newDS: '1' | 'X' | '2' | 'none' = 'none';
      let newDP = 0;
      if (maxD > 0.8) {
        newDP = maxD;
        newDS = d1 === maxD ? '1' : dX === maxD ? 'X' : '2';
      }
      m.dropPercent = newDP;
      m.dropSide = newDS;

      if (m.history && m.history.length > 0) {
        const li = m.history.length - 1;
        m.history[li] = { ...m.history[li], one: m.current.one, x: m.current.x, two: m.current.two, ts: 'Actuel' };
      }

      newM[idx] = m;

      if (newDP >= 4.5 && soundEnabled) {
        const droppedV = side === 'one' ? m.current.one : side === 'x' ? m.current.x : m.current.two;
        addNotification(`Baisse détectée : ${m.home} vs ${m.away} → ${newDS} @${droppedV.toFixed(2)} (−${newDP}%)`);
        playBeep();
      }
      setLastUpdate(new Date());
      return newM;
    });
  };

  useEffect(() => {
    let iv: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      iv = setInterval(() => {
        if (Math.random() < 0.35) {
          simulateDrop();
        } else {
          setMatches((prev) => {
            const up = [...prev];
            const n = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < n; i++) {
              const idxx = Math.floor(Math.random() * up.length);
              const mm = { ...up[idxx] };
              const sds: ('one' | 'x' | 'two')[] = ['one', 'x', 'two'];
              const sd = sds[Math.floor(Math.random() * 3)];
              const ch = (Math.random() - 0.5) * 0.04;
              mm.current = { ...mm.current, [sd]: Math.max(1.3, parseFloat((mm.current[sd] + ch).toFixed(2))) };
              const clc = (o: number, c: number) => ((o - c) / o) * 100;
              const dd1 = clc(mm.opening.one, mm.current.one);
              const ddX = clc(mm.opening.x, mm.current.x);
              const dd2 = clc(mm.opening.two, mm.current.two);
              const mxD = Math.max(dd1, ddX, dd2);
              if (mxD > mm.dropPercent + 1.5 && mxD > 3) {
                mm.dropPercent = parseFloat(mxD.toFixed(1));
                mm.dropSide = dd1 === mxD ? '1' : ddX === mxD ? 'X' : '2';
                if (soundEnabled && mxD > 5) {
                  addNotification(`Mouvement sur ${mm.home} vs ${mm.away}`);
                  playBeep();
                }
              }
              if (mm.history && mm.history.length > 0) {
                mm.history[mm.history.length - 1] = { ...mm.history[mm.history.length - 1], one: mm.current.one, x: mm.current.x, two: mm.current.two };
              }
              up[idxx] = mm;
            }
            setLastUpdate(new Date());
            return up;
          });
        }
      }, 16000);
    }
    return () => { if (iv) clearInterval(iv); };
  }, [autoRefresh, soundEnabled]);

  const displayedMatches = useMemo(() => {
    let res = matches.filter((m) => {
      if (filterDate !== 'all' && m.day !== filterDate) return false;
      if (minDrop > 0 && m.dropPercent < minDrop) return false;
      const t = searchTerm.toLowerCase().trim();
      if (t && !`${m.home} ${m.away} ${m.league} ${m.bookmaker}`.toLowerCase().includes(t)) return false;
      return true;
    });

    res.sort((a, b) => {
      let va: any, vb: any;
      if (sortConfig.key === 'kickoff') { va = a.kickoff; vb = b.kickoff; }
      else if (sortConfig.key === 'dropPercent') { va = a.dropPercent; vb = b.dropPercent; }
      else if (sortConfig.key === 'margin') { va = a.margin; vb = b.margin; }
      else if (sortConfig.key === 'league') { va = a.league; vb = b.league; }
      else { va = a.dropPercent; vb = b.dropPercent; }
      if (va < vb) return sortConfig.dir === 'asc' ? -1 : 1;
      if (va > vb) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return res;
  }, [matches, filterDate, minDrop, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((p) => p.key === key ? { key, dir: p.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'dropPercent' ? 'desc' : 'asc' });
  };

  const todayMatches = matches.filter((m) => m.day === 'today');
  const significantDrops = todayMatches.filter((m) => m.dropPercent >= 4).length;
  const biggestDrop = todayMatches.reduce((mx, m) => Math.max(mx, m.dropPercent), 0);

  const renderOddCell = (curr: number, open: number, dropped: boolean) => (
    <div className={`odd-cell text-center text-sm py-0.5 transition-all ${dropped ? 'odd-dropped font-bold' : 'odd-normal'}`}>
      {curr.toFixed(2)}
      {dropped && <div className="text-[9px] leading-none text-red-400/90 mt-px">↓${(((open - curr) / open) * 100).toFixed(0)}%</div>}
    </div>
  );

  const HistoryChart = ({ match }: { match: Match }) => {
    const data = match.history;
    if (!data || data.length === 0) return <p className="text-sm text-zinc-400 p-4">ÀPas d’historique.</p>;

    const w = 560, h = 210;
    const pad = { l: 48, r: 18, t: 22, b: 32 };
    let minO = 6.5, maxO = 1.2;
    data.forEach(d => { minO = Math.min(minO, d.one, d.x, d.two); maxO = Math.max(maxO, d.one, d.x, d.two); });
    minO = Math.max(1.2, Math.floor(minO * 10) / 10 - 0.15);
    maxO = Math.ceil(maxO * 10) / 10 + 0.15;

    const yS = (v: number) => pad.t + ((maxO - v) / (maxO - minO)) * (h - pad.t - pad.b);
    const xSt = (w - pad.l - pad.r) / Math.max(1, data.length - 1);

    const poly = (k: 'one' | 'x' | 'two') => data.map((d, i) => `${pad.l + i * xSt},${yS(d[k])}`).join(' ');

    return (
      <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800">
        <svg width="100%" height={h + 10} viewBox={`0 0 ${w} ${h + 38}`}>
          {[0,1,2,3,4].map(i => {
            const y = pad.t + (i * (h - pad.t - pad.b)) / 4;
            return <line key={i} x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />;
          })}
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h - pad.b} stroke="#475569" strokeWidth="1.5" />
          <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="#475569" strokeWidth="1.5" />
          {[minO, (minO + maxO) / 2, maxO].map((v, i) => (
            <text key={i} x={pad.l - 10} y={yS(v) + 3} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="monospace">{v.toFixed(1)}</text>
          ))}
          {data.map((d, i) => (
            <text key={i} x={pad.l + i * xSt} y={h - pad.b + 18} textAnchor="middle" fill="#64748b" fontSize="9">{d.ts}</text>
          ))}
          <polyline points={poly('one')} fill="none" stroke="#22c55e" strokeWidth="2.75" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={poly('x')} fill="none" stroke="#eab308" strokeWidth="2.75" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={poly('two')} fill="none" stroke="#3b82f6" strokeWidth="2.75" strokeLinejoin="round" strokeLinecap="round" />
          {data.length > 0 && (['one','x','two'] as const).map((k, idx) => {
            const cols = ['#22c55e', '#eab308', '#3b82f6'];
            const last = data[data.length-1];
            const x = pad.l + (data.length-1) * xSt;
            const y = yS(last[k]);
            return <g key={idx}><circle cx={x} cy={y} r="5" fill={cols[idx]} /><circle cx={x} cy={y} r="9" fill="none" stroke={cols[idx]} strokeWidth="1.5" opacity="0.4" /></g>;
          })}
          <g transform={`translate(${w - 155}, 8)`}>
            <rect x="0" y="1" width="14" height="3" rx="1" fill="#22c55e" /><text x="20" y="5" fill="#94a3b8" fontSize="10">1 Domicile</text>
            <rect x="0" y="15" width="14" height="3" rx="1" fill="#eab308" /><text x="20" y="19" fill="#94a3b8" fontSize="10">X Nul</text>
            <rect x="0" y="29" width="14" height="3" rx="1" fill="#3b82f6" /><text x="20" y="33" fill="#94a3b8" fontSize="10">2 Extérieur</text>
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f1f5f9] font-sans">
      {/* Top bar */}
      <div className="border-b border-zinc-800 bg-[#0a0f1a]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><span className="text-[#0a0f1a] font-bold text-xl tracking-tighter">OM</span></div>
              <div>
                <div className="font-semibold tracking-tight text-xl">OddsMath</div>
                <div className="text-[10px] text-emerald-500 -mt-1">CLONE • DROPPING ODDS</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />Données simulées en temps réel</div>
            <a href="https://www.oddsmath.com/" target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 hover:bg-zinc-900 transition flex items-center gap-1">Site original ↗</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter">Cotes en baisse &amp; Mouvements de cotes</h1>
            <p className="mt-2 text-lg text-zinc-400">Suivi en temps réel • Filtré par date • Alertes sonores • Graphiques d’historique</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2 text-xs">
              <span>Dernière mise à jour</span><span className="font-mono text-emerald-400">{lastUpdate.toLocaleTimeString('fr-FR')}</span>
            </div>
            <button onClick={() => { simulateDrop(); simulateDrop(); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sm transition active:scale-[0.985]">⟳ Simuler des baisses</button>
          </div>
        </div>

        <div className="mt-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-300">
          <div className="flex gap-3"><div className="text-emerald-500 mt-0.5">ℹ️</div>
            <div><span className="font-medium text-white">Les cotes qui baissent</span> surviennent généralement à cause d’un <span className="text-emerald-400">volume de paris important</span>, de l’absence/retour de joueurs clés, ou de suspicions de match arrangé. Ce clone reproduit fidèlement l’interface et les fonctionnalités principales de la section Dropping Odds d’OddsMath.com.</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4"><div className="text-xs text-zinc-400">Matchs aujourd’hui</div><div className="text-3xl font-semibold tabular-nums mt-1">{todayMatches.length}</div></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4"><div className="text-xs text-zinc-400">Baisses significatives (≥4%)</div><div className="text-3xl font-semibold tabular-nums mt-1 text-orange-400">{significantDrops}</div></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4"><div className="text-xs text-zinc-400">Plus grosse baisse du jour</div><div className="text-3xl font-semibold tabular-nums mt-1 text-red-400">{biggestDrop.toFixed(1)}%</div></div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5"><span>Mode live</span>
              <button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-3 py-0.5 rounded-full text-[10px] font-medium transition ${autoRefresh ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>{autoRefresh ? 'ACTIF' : 'INACTIF'}</button>
            </div>
            <div className="text-xs text-zinc-500">Actualisation automatique toutes les ~16s</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 pb-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-zinc-400 mr-2">Date :</span>
            {(['all','today','tomorrow'] as const).map(d => (
              <button key={d} onClick={() => setFilterDate(d)} className={`filter-btn px-4 py-1.5 rounded-2xl text-sm border transition ${filterDate === d ? 'active bg-emerald-500 text-black border-emerald-500' : 'border-zinc-700 hover:bg-zinc-800'}`}>
                {d === 'all' ? 'Tous' : d === 'today' ? "Aujourd'hui" : 'Demain'}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[220px]">
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher équipe ou compétition..." className="w-full bg-zinc-950 border border-zinc-700 focus:border-zinc-500 rounded-2xl px-4 py-2.5 text-sm placeholder:text-zinc-500 outline-none" />
          </div>

          <div className="flex items-center gap-3 text-sm min-w-[200px]">
            <span className="text-zinc-400 whitespace-nowrap">Baisse min. :</span>
            <input type="range" min={0} max={12} step={1} value={minDrop} onChange={e => setMinDrop(parseInt(e.target.value))} className="accent-emerald-500 w-28" />
            <span className="font-mono w-8 text-right text-emerald-400">{minDrop}%</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm transition ${soundEnabled ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400' : 'border-zinc-700 hover:bg-zinc-800'}`}>
              {soundEnabled ? '🔊' : '🔇'} Alerte sonore
            </button>
            <button onClick={() => { setAutoRefresh(!autoRefresh); if (!autoRefresh) addNotification('Mode surveillance live activé'); }} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm transition ${autoRefresh ? 'border-emerald-600 bg-emerald-950/40 text-emerald-400' : 'border-zinc-700 hover:bg-zinc-800'}`}>
              {autoRefresh ? '⏸' : '▶'} Auto-refresh
            </button>
            <button onClick={() => simulateDrop()} className="px-5 py-2 rounded-2xl bg-white text-black text-sm font-medium hover:bg-zinc-200 active:bg-white transition flex items-center gap-2">📉 Simuler une baisse</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-zinc-800">
            <div className="font-medium flex items-center gap-2">Tableau des mouvements de cotes <span className="text-xs px-2 py-px rounded bg-zinc-800 text-zinc-400 font-mono">{displayedMatches.length} résultats</span></div>
            <div className="text-xs text-zinc-500">Trié par {sortConfig.key} ({sortConfig.dir}) — Cliquez sur les en-têtes</div>
          </div>

          <div className="table-container overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-zinc-400 border-b border-zinc-800">
                  <th onClick={() => handleSort('kickoff')} className="cursor-pointer hover:text-white px-6 py-4 w-20">Heure</th>
                  <th onClick={() => handleSort('league')} className="cursor-pointer hover:text-white">Compétition</th>
                  <th className="px-2">Rencontre</th>
                  <th className="w-24">Bookmaker</th>
                  <th className="text-center w-20">1</th>
                  <th className="text-center w-20">X</th>
                  <th className="text-center w-20">2</th>
                  <th onClick={() => handleSort('dropPercent')} className="cursor-pointer hover:text-white text-center w-28">Baisse max</th>
                  <th onClick={() => handleSort('margin')} className="cursor-pointer hover:text-white text-center w-20">Marge</th>
                  <th className="w-28 text-center">Historique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm">
                {displayedMatches.length > 0 ? displayedMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-950/60 group">
                    <td className="font-mono text-emerald-400 px-6 py-4 whitespace-nowrap">{m.kickoff}</td>
                    <td className="font-medium text-white/90 pr-3">{m.league}</td>
                    <td className="font-medium pr-4">{m.home} <span className="text-zinc-500 font-normal mx-1">vs</span> {m.away}</td>
                    <td className="text-xs text-zinc-400 font-mono">{m.bookmaker}</td>
                    <td>{renderOddCell(m.current.one, m.opening.one, m.dropSide === '1')}</td>
                    <td>{renderOddCell(m.current.x, m.opening.x, m.dropSide === 'X')}</td>
                    <td>{renderOddCell(m.current.two, m.opening.two, m.dropSide === '2')}</td>
                    <td className="text-center">{m.dropPercent > 0 ? (
                      <div className={`inline-flex items-center justify-center gap-1 px-3 py-px rounded-full text-xs font-semibold tabular-nums tracking-tight ${m.dropPercent >= 8 ? 'bg-red-500/15 text-red-400' : m.dropPercent >= 4 ? 'bg-orange-500/15 text-orange-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{m.dropSide} ↓ {m.dropPercent}%</div>
                    ) : <span className="text-xs text-zinc-500">—</span>}</td>
                    <td className="font-mono text-center text-zinc-400 tabular-nums">{m.margin.toFixed(1)}%</td>
                    <td className="text-center"><button onClick={() => setSelectedMatch(m)} className="inline-flex items-center justify-center gap-1.5 text-xs px-3.5 py-1.5 rounded-2xl border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 active:bg-zinc-950 transition group-hover:border-zinc-500">📈 Graphique</button></td>
                  </tr>
                )) : <tr><td colSpan={10} className="px-6 py-12 text-center text-zinc-400">Aucun match ne correspond à vos filtres.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
            <div>Les cotes sont simulées à des fins de démonstration. Les valeurs réelles proviennent de bookmakers sharp (Pinnacle, SBOBET...).</div>
            <div className="hidden md:block">Clone fidèle de la section Dropping Odds • OddsMath.com</div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed top-20 right-6 z-[60] flex flex-col gap-2 w-80">
        {notifications.map((n) => (
          <div key={n.id} className="toast bg-zinc-900 border border-red-500/40 shadow-xl rounded-2xl px-4 py-3 text-sm flex gap-3 items-start">
            <div className="text-red-500 mt-0.5">🚨</div>
            <div className="flex-1 pr-1">
              <div className="text-red-400 text-xs font-mono mb-px">{n.time}</div>
              <div className="leading-snug text-zinc-200">{n.msg}</div>
            </div>
            <button onClick={() => setNotifications((p) => p.filter((x) => x.id !== n.id))} className="text-zinc-500 hover:text-white">×</button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setSelectedMatch(null)}>
          <div className="modal bg-zinc-900 border border-zinc-700 rounded-3xl max-w-[620px] w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-xl tracking-tight">{selectedMatch.home} vs {selectedMatch.away}</div>
                <div className="text-sm text-zinc-400">{selectedMatch.league} • {selectedMatch.kickoff} • {selectedMatch.bookmaker}</div>
              </div>
              <button onClick={() => setSelectedMatch(null)} className="text-2xl leading-none px-2 text-zinc-400 hover:text-white transition">×</button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="text-sm font-medium text-white/80">Évolution des cotes (historique)</div>
                {selectedMatch.dropPercent > 0 && <div className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 font-mono">Baisse max : {selectedMatch.dropSide} {selectedMatch.dropPercent}%</div>}
              </div>
              <HistoryChart match={selectedMatch} />
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
                <div className="bg-zinc-950 rounded-2xl p-3 border border-zinc-800"><div className="text-emerald-400 text-[10px] tracking-widest">1 - DOMICILE</div><div className="font-mono text-lg mt-px">{selectedMatch.current.one.toFixed(2)}</div><div className="text-[10px] text-zinc-500">Ouverture : {selectedMatch.opening.one.toFixed(2)}</div></div>
                <div className="bg-zinc-950 rounded-2xl p-3 border border-zinc-800"><div className="text-yellow-400 text-[10px] tracking-widest">X - NUL</div><div className="font-mono text-lg mt-px">{selectedMatch.current.x.toFixed(2)}</div><div className="text-[10px] text-zinc-500">Ouverture : {selectedMatch.opening.x.toFixed(2)}</div></div>
                <div className="bg-zinc-950 rounded-2xl p-3 border border-zinc-800"><div className="text-blue-400 text-[10px] tracking-widest">2 - EXTÉRIEUR</div><div className="font-mono text-lg mt-px">{selectedMatch.current.two.toFixed(2)}</div><div className="text-[10px] text-zinc-500">Ouverture : {selectedMatch.opening.two.toFixed(2)}</div></div>
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-950/70 border-t border-zinc-800 text-xs text-zinc-400 flex justify-between items-center">
              <div>Les lignes montrent l’évolution des cotes décimales au fil du temps.</div>
              <button onClick={() => setSelectedMatch(null)} className="px-4 py-1.5 rounded-xl border border-zinc-700 hover:bg-zinc-900">Fermer</button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6">Clone interactif créé pour démonstration • Toutes les données sont simulées et mises à jour en temps réel côté client.<br />Fonctionnalités principales reproduites : tableau triable, filtres, alertes sonores, mode live, graphique d’historique des cotes.<br /><span className="text-zinc-600">Inspiré par </span><a href="https://www.oddsmath.com/" className="underline hover:text-zinc-400" target="_blank" rel="noopener noreferrer">oddsmath.com</a> • Déployé sur Vercel</div>
      </footer>
    </div>
  );
}
