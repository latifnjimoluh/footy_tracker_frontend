import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Clock, 
  Activity, 
  AlertCircle, 
  RefreshCw,
  Search,
  WifiOff,
  Wifi,
  BrainCircuit,
  Sparkles,
  LayoutDashboard,
  Star,
  Zap,
  List,
  ArrowUpDown,
  TrendingUp,
  Filter,
  Bell,
  Volume2,
  VolumeX,
  AlertTriangle,
  TrendingDown,
  ExternalLink,
  CheckCircle,
  XCircle,
  Target,
  Timer,
  Flame,
  History
} from 'lucide-react';

const App = () => {
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isOffline, setIsOffline] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMatchAnalysis, setSelectedMatchAnalysis] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [radarMode, setRadarMode] = useState(false);
  const [alertedMatches, setAlertedMatches] = useState(new Set());
  const [confidenceScores, setConfidenceScores] = useState({});
  const [sessionHistory, setSessionHistory] = useState([]);

  const apiKey = import.meta.env.VITE_API_KEY;
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api/matchs/all';

  const mockData = [
    { id: "1", championnat: "Premier League", heure_match: "21:00", minute: "65", home: "Man Utd", away: "Newcastle", score: "0-0", cote_1: "1.90", cote_2: "3.40", open_cote_1: "1.35", open_cote_2: "6.40" },
    { id: "2", championnat: "Ligue 1", heure_match: "19:00", minute: "72", home: "PSG", away: "Lorient", score: "1-0", cote_1: "1.12", cote_2: "15.00", open_cote_1: "1.15", open_cote_2: "12.00" },
    { id: "3", championnat: "Serie A", heure_match: "20:45", minute: "58", home: "Juventus", away: "Empoli", score: "0-0", cote_1: "1.95", cote_2: "5.00", open_cote_1: "1.25", open_cote_2: "9.00" },
    { id: "4", championnat: "Liga", heure_match: "21:00", minute: "15", home: "Real Madrid", away: "Getafe", score: "0-0", cote_1: "1.22", cote_2: "12.00", open_cote_1: "1.20", open_cote_2: "13.00" },
    { id: "5", championnat: "Bundesliga", heure_match: "15:30", minute: "Terminé", home: "Bayern", away: "Dortmund", score: "2-1", cote_1: "1.55", cote_2: "5.00", open_cote_1: "1.55", open_cote_2: "5.00", result: "won" },
    { id: "6", championnat: "Premier League", heure_match: "17:30", minute: "Terminé", home: "Chelsea", away: "Brighton", score: "1-1", cote_1: "1.40", cote_2: "6.50", open_cote_1: "1.40", open_cote_2: "6.50", result: "draw" },
    { id: "7", championnat: "Ligue 1", heure_match: "21:00", minute: "Terminé", home: "Lyon", away: "Marseille", score: "2-0", cote_1: "2.10", cote_2: "3.20", open_cote_1: "2.10", open_cote_2: "3.20", result: "won" }
  ];

  const fetchMatchs = useCallback(async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(API_URL, { 
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Séparer les matchs terminés
      const finished = data.filter(m => m.minute === "Terminé" || m.minute === "FT");
      const live = data.filter(m => m.minute !== "Terminé" && m.minute !== "FT");
      
      setMatchs(live);
      setSessionHistory(finished);
      setIsOffline(false);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      // Utiliser les données mock en cas d'erreur (backend indisponible)
      setIsOffline(true);
      setMatchs(mockData.filter(m => m.minute !== "Terminé"));
      setSessionHistory(mockData.filter(m => m.minute === "Terminé"));
      setLastUpdate(new Date().toLocaleTimeString() + " (Mode Démo)");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMatchs();
    const interval = setInterval(fetchMatchs, 60000);
    return () => clearInterval(interval);
  }, [fetchMatchs]);

  const callGemini = async (prompt) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "Expert en paris sportifs. Analyse concise en français." }] }
        })
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      return "Analyse indisponible.";
    }
  };

  const playAlertSound = (type = 'opportunity') => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'critical') {
        [0, 0.15, 0.3].forEach(delay => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, audioContext.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.1);
          osc.start(audioContext.currentTime + delay);
          osc.stop(audioContext.currentTime + delay + 0.1);
        });
      } else {
        oscillator.frequency.value = 523.25;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Audio non disponible');
    }
  };

  useEffect(() => {
    if (!radarMode || matchs.length === 0) return;

    matchs.forEach(m => {
      const algoStatus = getAlgoStatus(m);
      const matchId = m.id;

      if (algoStatus === 'CRITIQUE' && !alertedMatches.has(`${matchId}-critical`)) {
        playAlertSound('critical');
        setAlertedMatches(prev => new Set(prev).add(`${matchId}-critical`));
      }

      const minCote = Math.min(parseFloat(m.cote_1), parseFloat(m.cote_2));
      const isNewOpportunity = (minCote >= 1.25 && minCote <= 1.50) || minCote < 1.25;
      
      if (isNewOpportunity && !alertedMatches.has(`${matchId}-opportunity`)) {
        playAlertSound('opportunity');
        setAlertedMatches(prev => new Set(prev).add(`${matchId}-opportunity`));
      }
    });
  }, [matchs, radarMode, alertedMatches]);

  const analyzeGlobalMarket = async () => {
    setIsAnalyzing(true);
    const context = matchs.map(m => `${m.home} vs ${m.away} (${m.score}, ${m.minute}', Cotes: ${m.cote_1}/${m.cote_2})`).join(', ');
    const prompt = `Analyse ces matchs : ${context}. Quelles sont les 3 meilleures opportunités pour un but tardif (over 0.5) ?`;
    const analysis = await callGemini(prompt);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const analyzeSingleMatch = async (match) => {
    setSelectedMatchAnalysis(prev => ({ ...prev, [match.id]: { loading: true } }));
    const prompt = `Match: ${match.home}-${match.away}, Score: ${match.score}, Temps: ${match.minute}, Cotes: ${match.cote_1}/${match.cote_2}. 
    
    Réponds UNIQUEMENT au format JSON suivant (sans texte avant ou après):
    {
      "confidence": 75,
      "analysis": "Analyse rapide en 2 phrases max"
    }
    
    Le score confidence doit être entre 0 et 100.`;
    
    const response = await callGemini(prompt);
    
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      setSelectedMatchAnalysis(prev => ({ 
        ...prev, 
        [match.id]: { 
          text: parsed.analysis || "Analyse indisponible",
          confidence: parsed.confidence || 50,
          loading: false 
        } 
      }));
      
      setConfidenceScores(prev => ({
        ...prev,
        [match.id]: parsed.confidence || 50
      }));
    } catch (error) {
      setSelectedMatchAnalysis(prev => ({ 
        ...prev, 
        [match.id]: { 
          text: response || "Analyse indisponible",
          confidence: 50,
          loading: false 
        } 
      }));
    }
  };

  const getFavs = () => matchs.filter(m => {
    const c1 = parseFloat(m.cote_1);
    const c2 = parseFloat(m.cote_2);
    const minCote = Math.min(c1, c2);
    return minCote >= 1.25 && minCote <= 1.50;
  });

  const getUltraFavs = () => matchs.filter(m => {
    const c1 = parseFloat(m.cote_1);
    const c2 = parseFloat(m.cote_2);
    return Math.min(c1, c2) < 1.25;
  });

  const getGoliathPanic = () => matchs.filter(m => {
    if (!m.minute || m.minute === "Pas commencé") return false;
    
    const minute = parseInt(m.minute);
    if (minute < 70) return false;
    
    const c1 = parseFloat(m.cote_1);
    const c2 = parseFloat(m.cote_2);
    const [s1, s2] = m.score.split('-').map(s => parseInt(s) || 0);
    
    const homeGoliath = c1 < 1.20 && s1 <= s2;
    const awayGoliath = c2 < 1.20 && s2 <= s1;
    
    return homeGoliath || awayGoliath;
  });

  const getAlgoStatus = (m) => {
    if (!m.minute || m.minute === "Pas commencé") return null;
    const min = parseInt(m.minute);
    const scoreSum = m.score.split('-').reduce((a, b) => parseInt(a) + (parseInt(b) || 0), 0);
    if (min >= 55 && min <= 75 && scoreSum === 0) return 'CRITIQUE';
    return null;
  };

  const getMomentum = (m) => {
    if (!m.minute || m.minute === "Pas commencé") return null;
    
    const c1 = parseFloat(m.cote_1);
    const c2 = parseFloat(m.cote_2);
    const [s1, s2] = m.score.split('-').map(s => parseInt(s) || 0);
    const minute = parseInt(m.minute);

    if (c1 < 1.40 && s1 <= s2 && minute > 15) return 'home';
    if (c2 < 1.40 && s2 <= s1 && minute > 15) return 'away';

    return null;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortMatches = (matches) => {
    if (!sortConfig.key) return matches;

    return [...matches].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case 'time':
          aVal = a.minute === "Pas commencé" ? -1 : parseInt(a.minute);
          bVal = b.minute === "Pas commencé" ? -1 : parseInt(b.minute);
          break;
        case 'cote':
          aVal = Math.min(parseFloat(a.cote_1), parseFloat(a.cote_2));
          bVal = Math.min(parseFloat(b.cote_1), parseFloat(b.cote_2));
          break;
        case 'league':
          aVal = a.championnat;
          bVal = b.championnat;
          break;
        case 'home':
          aVal = a.home;
          bVal = b.home;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterMatches = (matches) => {
    if (!searchTerm) return matches;
    const term = searchTerm.toLowerCase();
    return matches.filter(m => 
      m.home.toLowerCase().includes(term) ||
      m.away.toLowerCase().includes(term) ||
      m.championnat.toLowerCase().includes(term)
    );
  };

  const getProcessedMatches = (matches) => {
    return sortMatches(filterMatches(matches));
  };

  const getBookmakerLink = (match) => {
    return `https://1xbet.com/search?query=${encodeURIComponent(match.home + ' ' + match.away)}`;
  };

  const SortButton = ({ label, sortKey }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        sortConfig.key === sortKey
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
          : 'bg-slate-900/50 text-slate-500 hover:bg-slate-900 hover:text-cyan-400 border border-slate-800'
      }`}
    >
      {label}
      <ArrowUpDown size={12} className={sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'rotate-180' : ''} />
    </button>
  );

  const ConfidenceScore = ({ score }) => {
    if (!score) return null;
    
    const getColor = (s) => {
      if (s >= 75) return { text: 'text-lime-400' };
      if (s >= 50) return { text: 'text-amber-400' };
      return { text: 'text-red-400' };
    };
    
    const colors = getColor(score);
    const circumference = 2 * Math.PI * 16;
    const offset = circumference - (score / 100) * circumference;
    
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-10 h-10">
          <svg className="transform -rotate-90" width="40" height="40">
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-900" />
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} className={`${colors.text} transition-all duration-500`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-[10px] font-black ${colors.text}`}>{score}</span>
          </div>
        </div>
        <div className="text-[9px] uppercase font-bold text-slate-600">Confiance<br/>IA</div>
      </div>
    );
  };

  const OddsDisplay = ({ current, open }) => {
    const curVal = parseFloat(current);
    const openVal = open ? parseFloat(open) : null;
    const isHigher = openVal && curVal > openVal;

    return (
      <div className="flex items-center justify-end gap-1.5">
        {openVal && openVal !== curVal && (
          <span className="text-[10px] text-slate-600 line-through decoration-slate-700 opacity-60">{open}</span>
        )}
        <span className={`font-mono px-1.5 rounded ${isHigher ? 'text-lime-400 font-black text-sm bg-lime-900/20 border border-lime-500/30' : 'text-slate-500 bg-black/50 text-xs'}`}>
          {current}
        </span>
      </div>
    );
  };

  const MatchCard = ({ m }) => {
    const algoStatus = getAlgoStatus(m);
    const mAnalysis = selectedMatchAnalysis[m.id];
    const momentum = getMomentum(m);
    const confidence = confidenceScores[m.id] || mAnalysis?.confidence;
    
    const minute = m.minute !== "Pas commencé" ? parseInt(m.minute) : 0;
    const [s1, s2] = m.score.split('-').map(s => parseInt(s) || 0);
    const c1 = parseFloat(m.cote_1);
    const c2 = parseFloat(m.cote_2);
    const isGoliathPanic = minute >= 70 && ((c1 < 1.20 && s1 <= s2) || (c2 < 1.20 && s2 <= s1));
    
    return (
      <div className={`bg-slate-950/60 border backdrop-blur-sm rounded-2xl p-4 transition-all group ${
        isGoliathPanic ? 'border-red-500/50 shadow-lg shadow-red-900/30 animate-pulse' : algoStatus === 'CRITIQUE' ? 'border-orange-500/50 shadow-lg shadow-orange-900/20' : 'border-slate-800/50 hover:border-cyan-500/50'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{m.championnat}</span>
          <div className="flex items-center gap-2">
             {parseFloat(m.cote_1) < 1.25 || parseFloat(m.cote_2) < 1.25 ? <Zap size={14} className="text-amber-400" /> : null}
             {isGoliathPanic && <span className="text-[8px] bg-red-500/30 text-red-400 px-2 py-0.5 rounded-full font-black uppercase border border-red-500/50 animate-pulse">🚨 PANIC</span>}
             {algoStatus === 'CRITIQUE' && !isGoliathPanic && <span className="text-[8px] bg-orange-500/30 text-orange-400 px-2 py-0.5 rounded-full font-black uppercase border border-orange-500/50">Critique</span>}
             <span className="text-[11px] text-slate-600 italic">{m.heure_match}</span>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center text-sm relative">
            <div className="flex items-center gap-2">
              <span className={parseFloat(m.cote_1) < parseFloat(m.cote_2) ? "font-bold text-cyan-400" : "text-slate-300"}>{m.home}</span>
              {momentum === 'home' && (
                <div className="flex items-center gap-1 animate-pulse">
                   <TrendingUp size={16} className="text-lime-500" />
                   <div className="hidden group-hover:block text-[9px] text-lime-400 font-bold uppercase tracking-wider bg-lime-500/10 px-1 rounded">Pression</div>
                </div>
              )}
            </div>
            <OddsDisplay current={m.cote_1} open={m.open_cote_1} />
            {momentum === 'home' && <div className="absolute -bottom-1.5 left-0 w-16 h-0.5 bg-lime-500 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.8)]"></div>}
          </div>

          <div className="flex justify-between items-center text-sm relative">
            <div className="flex items-center gap-2">
              <span className={parseFloat(m.cote_2) < parseFloat(m.cote_1) ? "font-bold text-cyan-400" : "text-slate-300"}>{m.away}</span>
              {momentum === 'away' && (
                <div className="flex items-center gap-1 animate-pulse">
                   <TrendingUp size={16} className="text-lime-500" />
                   <div className="hidden group-hover:block text-[9px] text-lime-400 font-bold uppercase tracking-wider bg-lime-500/10 px-1 rounded">Pression</div>
                </div>
              )}
            </div>
            <OddsDisplay current={m.cote_2} open={m.open_cote_2} />
            {momentum === 'away' && <div className="absolute -bottom-1.5 left-0 w-16 h-0.5 bg-lime-500 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.8)]"></div>}
          </div>
        </div>

        <div className="bg-black/60 rounded-xl p-3 flex justify-between items-center border border-slate-800/30 mb-3">
          <div className="text-xl font-black text-lime-400 tabular-nums">{m.score}</div>
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Clock size={10} />
            {m.minute}'
          </div>
        </div>
        
        {confidence && (
          <div className="mb-3 bg-black/50 rounded-xl p-3 border border-slate-800/30">
            <ConfidenceScore score={confidence} />
          </div>
        )}
        
        {mAnalysis && (
          <div className="mb-3 text-[10px] text-cyan-300 bg-cyan-500/10 p-2 rounded border border-cyan-500/20 italic">
            {mAnalysis.loading ? "Analyse en cours..." : mAnalysis.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => analyzeSingleMatch(m)}
            className="py-2 bg-slate-900/80 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <BrainCircuit size={12} /> IA
          </button>
          <a
            href={getBookmakerLink(m)}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30"
          >
            <ExternalLink size={12} /> BET
          </a>
        </div>
      </div>
    );
  };

  const HistoryMatch = ({ m }) => {
    const [s1, s2] = m.score.split('-').map(s => parseInt(s) || 0);
    const c1 = parseFloat(m.cote_1);
    const c2 = parseFloat(m.cote_2);
    
    let prediction = '';
    let isWon = false;
    
    if (c1 < c2) {
      prediction = m.home;
      isWon = s1 > s2;
    } else {
      prediction = m.away;
      isWon = s2 > s1;
    }
    
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl border ${isWon ? 'bg-lime-950/20 border-lime-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
        <div className="flex items-center gap-3">
          {isWon ? <CheckCircle size={20} className="text-lime-400" /> : <XCircle size={20} className="text-red-400" />}
          <div>
            <p className="text-sm font-bold text-slate-300">{m.home} vs {m.away}</p>
            <p className="text-xs text-slate-500">{m.championnat} - {m.heure_match}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-lime-400 tabular-nums">{m.score}</p>
          <p className={`text-[10px] font-bold uppercase ${isWon ? 'text-lime-400' : 'text-red-400'}`}>
            {isWon ? '✅ Gagné' : '❌ Perdu'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-slate-800/50 h-16 flex items-center justify-between px-4 md:px-8 shadow-xl shadow-black/50">
        <button 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Trophy className="text-cyan-400" size={24} />
          <span className="text-xl font-black tracking-tighter">FOOTY<span className="text-cyan-400">TRACKER</span></span>
        </button>
        
        <div className="flex items-center gap-2">
          {[
            { id: 'home', icon: LayoutDashboard, label: 'Accueil' },
            { id: 'favs', icon: Star, label: 'Favoris' },
            { id: 'ultra', icon: Zap, label: 'Ultra' },
            { id: 'goliath', icon: AlertTriangle, label: 'Goliath' },
            { id: 'history', icon: History, label: 'Historique' },
            { id: 'all', icon: List, label: 'Tous' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-900/50'
              }`}
            >
              <item.icon size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Navigation mobile en bas */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-slate-800/50 p-2 flex justify-around shadow-xl shadow-black/50">
        {[
          { id: 'home', icon: LayoutDashboard, label: 'Accueil' },
          { id: 'favs', icon: Star, label: 'Favoris' },
          { id: 'ultra', icon: Zap, label: 'Ultra' },
          { id: 'goliath', icon: AlertTriangle, label: 'Goliath' },
          { id: 'history', icon: History, label: 'Hist.' },
          { id: 'all', icon: List, label: 'Tous' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50' : 'text-slate-500 hover:text-cyan-400'
            }`}
          >
            <item.icon size={18} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="pt-20 pb-20 md:pb-8 px-4 md:px-8 max-w-[1920px] mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center gap-4">
              <div className="md:hidden flex items-center gap-2">
                <Trophy className="text-cyan-400" size={32} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
                  <span className="md:hidden">FOOTY<span className="text-cyan-400">TRACKER</span></span>
                  <span className="hidden md:inline">DASHBOARD <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">LIVE</span></span>
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-slate-500 text-sm">Mise à jour : {lastUpdate}</p>
                  <span className={`flex items-center gap-1 text-xs ${isOffline ? 'text-amber-400' : 'text-lime-400'}`}>
                    {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
                    {isOffline ? 'Mode Démo' : 'Live'}
                  </span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-700/20 border border-cyan-500/30 p-6 rounded-2xl shadow-xl shadow-cyan-900/20 relative overflow-hidden group backdrop-blur-sm">
                <Star className="absolute -right-4 -bottom-4 text-cyan-400/10 w-32 h-32 group-hover:scale-110 transition-transform" />
                <h3 className="text-cyan-400/80 text-[10px] font-black uppercase tracking-widest mb-2">Favoris Détectés</h3>
                <div className="text-4xl font-black text-white">{getFavs().length}</div>
                <p className="text-slate-400 text-[10px] mt-1">Cotes 1.25 - 1.50</p>
                <button onClick={() => setActiveTab('favs')} className="mt-3 text-[10px] bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1.5 rounded-full backdrop-blur-md transition-all border border-cyan-500/50 text-cyan-400 font-bold">Voir</button>
              </div>

              <div className="bg-gradient-to-br from-amber-600/20 to-orange-700/20 border border-amber-500/30 p-6 rounded-2xl shadow-xl shadow-amber-900/20 relative overflow-hidden group backdrop-blur-sm">
                <Zap className="absolute -right-4 -bottom-4 text-amber-400/10 w-32 h-32 group-hover:scale-110 transition-transform" />
                <h3 className="text-amber-400/80 text-[10px] font-black uppercase tracking-widest mb-2">Ultra Favoris</h3>
                <div className="text-4xl font-black text-white">{getUltraFavs().length}</div>
                <p className="text-slate-400 text-[10px] mt-1">Cotes moins de 1.25</p>
                <button onClick={() => setActiveTab('ultra')} className="mt-3 text-[10px] bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-full backdrop-blur-md transition-all border border-amber-500/50 text-amber-400 font-bold">Voir</button>
              </div>

              <div className="bg-gradient-to-br from-red-600/20 to-rose-700/20 border border-red-500/30 p-6 rounded-2xl shadow-xl shadow-red-900/20 relative overflow-hidden group backdrop-blur-sm">
                <AlertTriangle className="absolute -right-4 -bottom-4 text-red-400/10 w-32 h-32 group-hover:scale-110 transition-transform" />
                <h3 className="text-red-400/80 text-[10px] font-black uppercase tracking-widest mb-2">Goliath Panic</h3>
                <div className="text-4xl font-black text-white">{getGoliathPanic().length}</div>
                <p className="text-slate-400 text-[10px] mt-1">Ultra fav en difficulté</p>
                <button onClick={() => setActiveTab('goliath')} className="mt-3 text-[10px] bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 rounded-full backdrop-blur-md transition-all border border-red-500/50 text-red-400 font-bold">Alerte</button>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-pink-700/20 border border-purple-500/30 p-6 rounded-2xl shadow-xl shadow-purple-900/20 relative overflow-hidden group backdrop-blur-sm">
                <Target className="absolute -right-4 -bottom-4 text-purple-400/10 w-32 h-32 group-hover:scale-110 transition-transform" />
                <h3 className="text-purple-400/80 text-[10px] font-black uppercase tracking-widest mb-2">Matchs Critiques</h3>
                <div className="text-4xl font-black text-white">
                  {matchs.filter(m => getAlgoStatus(m) === 'CRITIQUE').length}
                </div>
                <p className="text-slate-400 text-[10px] mt-1">55-75' à 0-0</p>
                <div className="mt-3 text-[10px] text-purple-400 font-bold">Zone Rouge</div>
              </div>

              <div className="bg-gradient-to-br from-lime-600/20 to-green-700/20 border border-lime-500/30 p-6 rounded-2xl shadow-xl shadow-lime-900/20 relative overflow-hidden group backdrop-blur-sm">
                <TrendingUp className="absolute -right-4 -bottom-4 text-lime-400/10 w-32 h-32 group-hover:scale-110 transition-transform" />
                <h3 className="text-lime-400/80 text-[10px] font-black uppercase tracking-widest mb-2">Momentum Actif</h3>
                <div className="text-4xl font-black text-white">
                  {matchs.filter(m => getMomentum(m) !== null).length}
                </div>
                <p className="text-slate-400 text-[10px] mt-1">Pression détectée</p>
                <div className="mt-3 text-[10px] text-lime-400 font-bold">En Live</div>
              </div>

              <div className="bg-gradient-to-br from-orange-600/20 to-red-700/20 border border-orange-500/30 p-6 rounded-2xl shadow-xl shadow-orange-900/20 relative overflow-hidden group backdrop-blur-sm">
                <Flame className="absolute -right-4 -bottom-4 text-orange-400/10 w-32 h-32 group-hover:scale-110 transition-transform" />
                <h3 className="text-orange-400/80 text-[10px] font-black uppercase tracking-widest mb-2">Value Bets</h3>
                <div className="text-4xl font-black text-white">
                  {matchs.filter(m => {
                    const c1 = parseFloat(m.cote_1);
                    const c2 = parseFloat(m.cote_2);
                    const o1 = m.open_cote_1 ? parseFloat(m.open_cote_1) : c1;
                    const o2 = m.open_cote_2 ? parseFloat(m.open_cote_2) : c2;
                    return (c1 > o1 + 0.2) || (c2 > o2 + 0.2);
                  }).length}
                </div>
                <p className="text-slate-400 text-[10px] mt-1">Cotes en hausse</p>
                <div className="mt-3 text-[10px] text-orange-400 font-bold">Opportunités</div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/50 p-6 rounded-2xl relative backdrop-blur-sm">
                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Actions IA</h3>
                <button 
                  onClick={analyzeGlobalMarket}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 mb-3"
                >
                  <Sparkles size={16} className={isAnalyzing ? "animate-spin" : ""} />
                  {isAnalyzing ? 'ANALYSE...' : 'RAPPORT'}
                </button>
                
                <button
                  onClick={() => {
                    setRadarMode(!radarMode);
                    if (!radarMode) {
                      playAlertSound('opportunity');
                      setAlertedMatches(new Set());
                    }
                  }}
                  className={`w-full py-2.5 rounded-lg font-black text-[10px] flex items-center justify-center gap-2 transition-all ${
                    radarMode ? 'bg-lime-500/20 text-lime-400 border border-lime-500/50 shadow-lg shadow-lime-500/20 animate-pulse' : 'bg-slate-900/50 text-slate-500 hover:bg-slate-900 border border-slate-800'
                  }`}
                >
                  {radarMode ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  {radarMode ? 'RADAR ON' : 'RADAR OFF'}
                </button>
                
                <div className="mt-4 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">Total</span>
                  <span className="text-lime-400 font-black text-lg tabular-nums">{matchs.length}</span>
                </div>
              </div>
            </div>

            {aiAnalysis && (
              <div className="bg-slate-950/80 border border-cyan-500/30 p-6 rounded-2xl border-l-4 border-l-cyan-400 animate-in slide-in-from-left duration-300 shadow-xl shadow-cyan-900/20">
                <div className="flex items-center gap-2 mb-4 text-cyan-400">
                  <BrainCircuit size={20} />
                  <span className="font-black text-xs uppercase tracking-wider">Analyse Stratégique Gemini</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{aiAnalysis}</p>
              </div>
            )}

            {radarMode && (
              <div className="bg-lime-950/20 border border-lime-500/30 p-4 rounded-2xl flex items-start gap-3 animate-in slide-in-from-bottom duration-300 shadow-lg shadow-lime-900/20">
                <Bell size={20} className="text-lime-400 animate-pulse" />
                <div>
                  <h3 className="text-lime-400 font-black text-xs uppercase mb-1">Mode Radar Actif</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Vous serez alerté par un son lorsqu'une opportunité se présente ou qu'un match entre en phase critique (60-75' à 0-0).
                  </p>
                </div>
              </div>
            )}

            {sessionHistory.length > 0 && (
              <div className="bg-slate-950/60 border border-slate-800/50 p-6 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <History size={20} className="text-slate-500" />
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">Historique de la Session</h3>
                  <span className="ml-auto text-xs text-slate-600">
                    {sessionHistory.filter(m => {
                      const [s1, s2] = m.score.split('-').map(s => parseInt(s) || 0);
                      const c1 = parseFloat(m.cote_1);
                      const c2 = parseFloat(m.cote_2);
                      if (c1 < c2) return s1 > s2;
                      return s2 > s1;
                    }).length} / {sessionHistory.length} réussis
                  </span>
                </div>
                <div className="space-y-2">
                  {sessionHistory.slice(0, 5).map((m, idx) => (
                    <HistoryMatch key={idx} m={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <History className="text-slate-500" size={28} />
                  Historique Complet
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  {sessionHistory.length} matchs terminés - {sessionHistory.filter(m => {
                    const [s1, s2] = m.score.split('-').map(s => parseInt(s) || 0);
                    const c1 = parseFloat(m.cote_1);
                    const c2 = parseFloat(m.cote_2);
                    if (c1 < c2) return s1 > s2;
                    return s2 > s1;
                  }).length} prédictions correctes
                </p>
              </div>
              <button onClick={fetchMatchs} className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-500 transition-all shadow-lg">
                <RefreshCw size={18} className={loading ? "animate-spin text-cyan-400" : "text-slate-500"} />
              </button>
            </div>

            {sessionHistory.length > 0 ? (
              <div className="space-y-3">
                {sessionHistory.map((m, idx) => (
                  <HistoryMatch key={idx} m={m} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <History size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-slate-600 font-bold uppercase tracking-widest">Aucun match terminé pour le moment</p>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'favs' || activeTab === 'ultra' || activeTab === 'all' || activeTab === 'goliath') && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {activeTab === 'favs' && "Cotes Favoris (1.25 - 1.50)"}
                  {activeTab === 'ultra' && "Ultra Favoris (moins de 1.25)"}
                  {activeTab === 'goliath' && (
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="text-red-400" size={24} />
                      <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">Goliath en Panique</span>
                    </span>
                  )}
                  {activeTab === 'all' && "Tous les Matchs Live"}
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  {activeTab === 'favs' && `${getFavs().length} matchs détectés`}
                  {activeTab === 'ultra' && `${getUltraFavs().length} matchs ultra favoris`}
                  {activeTab === 'goliath' && <span className="text-red-400 font-bold">{getGoliathPanic().length} ultra favoris en difficulté (70'+ sans avance)</span>}
                  {activeTab === 'all' && `${matchs.length} matchs au total`}
                </p>
              </div>
              <button onClick={fetchMatchs} className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-cyan-500 transition-all shadow-lg">
                <RefreshCw size={18} className={loading ? "animate-spin text-cyan-400" : "text-slate-500"} />
              </button>
            </div>

            {activeTab === 'goliath' && getGoliathPanic().length > 0 && (
              <div className="bg-gradient-to-r from-red-950/50 to-orange-950/50 border border-red-500/30 p-4 rounded-2xl mb-6 flex items-start gap-3 shadow-xl shadow-red-900/20">
                <TrendingDown size={24} className="text-red-400 animate-bounce" />
                <div>
                  <h3 className="text-red-400 font-black text-sm uppercase mb-1">🚨 Opportunité Critique Détectée</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Ces équipes ultra favorites (moins de 1.20) ne gagnent pas après 70 minutes. Cotes en forte hausse probable. Moment idéal pour un "Panic Buy".
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-4 mb-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Search size={18} className="text-slate-600" />
                <input
                  type="text"
                  placeholder="Rechercher équipe ou championnat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-600"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-cyan-400 transition-colors">✕</button>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-slate-600" />
                <span className="text-xs text-slate-600 font-bold uppercase">Trier par:</span>
                <SortButton label="Minute" sortKey="time" />
                <SortButton label="Cote Min" sortKey="cote" />
                <SortButton label="Ligue" sortKey="league" />
                <SortButton label="Équipe" sortKey="home" />
                {sortConfig.key && (
                  <button onClick={() => setSortConfig({ key: null, direction: 'asc' })} className="text-xs text-slate-500 hover:text-cyan-400 underline ml-2 transition-colors">Réinitialiser</button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getProcessedMatches(activeTab === 'favs' ? getFavs() : activeTab === 'ultra' ? getUltraFavs() : activeTab === 'goliath' ? getGoliathPanic() : matchs).map(m => (
                <MatchCard key={m.id} m={m} />
              ))}
            </div>

            {getProcessedMatches(activeTab === 'favs' ? getFavs() : activeTab === 'ultra' ? getUltraFavs() : activeTab === 'goliath' ? getGoliathPanic() : matchs).length === 0 && (
              <div className="py-20 text-center">
                <AlertCircle size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-slate-600 font-bold uppercase tracking-widest">
                  {searchTerm ? 'Aucun résultat trouvé' : activeTab === 'goliath' ? 'Aucun Goliath en panique pour le moment' : 'Aucun match dans cette catégorie'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;