import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Calendar,
  Activity,
  Filter,
  WifiOff,
  ArrowUpDown,
  Flame,
  LayoutDashboard,
  Menu,
  X,
  Zap,
  Clock,
  ChevronRight,
  TrendingDown,
  Globe,
  ChevronLeft,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

// --- CONFIG ---
const API_URL = 'http://127.0.0.1:8000';

// --- DONNÉES DE DÉMONSTRATION (FALLBACK SI API KO) ---
const MOCK_STATS = {
  counters: {
    total_matches: 1250,
    live: 12,
    favorites: 8,
    upcoming: 45,
    leagues: 5,
    finished: 1185
  }
};

const MOCK_LEAGUES = [
  { id: "l1", name: "Premier League", url: "#" },
  { id: "l2", name: "La Liga", url: "#" },
  { id: "l3", name: "Serie A", url: "#" },
  { id: "l4", name: "Bundesliga", url: "#" },
  { id: "l5", name: "Ligue 1", url: "#" }
];

const MOCK_MATCHES = [
  { id: "m1", home_team: "Man. City", away_team: "Arsenal", start_time: new Date().toISOString(), status: "LIVE", league: { name: "Premier League" }, stats: [{ score_home: 1, score_away: 1, game_clock: "72'" }] },
  { id: "m2", home_team: "Real Madrid", away_team: "Barcelone", start_time: new Date(Date.now() + 86400000).toISOString(), status: "UPCOMING", league: { name: "La Liga" }, stats: [] },
  { id: "m3", home_team: "Liverpool", away_team: "Chelsea", start_time: new Date(Date.now() - 86400000).toISOString(), status: "FINISHED", league: { name: "Premier League" }, stats: [{ score_home: 3, score_away: 1 }] }
];

const MOCK_FAVORITES = [
  { match_id: "m1", initial_odd: 1.22, bet_type: "1", match: MOCK_MATCHES[0] },
  { match_id: "m2", initial_odd: 1.35, bet_type: "2", match: MOCK_MATCHES[1] }
];

// --- COMPOSANTS UI ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge >= 0 && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
        {badge}
      </span>
    )}
  </button>
);

const StatWidget = ({ label, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 transition-all hover:border-blue-100">
    <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 text-${colorClass.split('-')[1]}-600`}>
      <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-xl font-bold text-slate-800 leading-none mt-0.5">{value}</h3>
    </div>
  </div>
);

const MatchCard = ({ data, isFavoriteView = true }) => {
  const match = isFavoriteView ? data.match : data;
  const isHomeFav = isFavoriteView ? data.bet_type === "1" : true;
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  
  const lastStat = match.stats && match.stats.length > 0 ? match.stats[match.stats.length - 1] : null;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full relative overflow-hidden">
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
            {lastStat?.game_clock || 'LIVE'}
          </span>
        </div>
      )}

      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center text-[11px] text-slate-500">
        <Trophy size={12} className="text-slate-400 mr-2" />
        <span className="truncate font-medium uppercase tracking-tight">
          {match.league?.name || "Ligue Inconnue"}
        </span>
      </div>

      <div className="p-5 flex-grow space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center flex-1 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
              {match.home_team.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-center leading-tight min-h-[2rem] flex items-center font-bold text-slate-800">
              {match.home_team}
            </span>
          </div>

          <div className="px-4 flex flex-col items-center">
            {(isLive || isFinished) ? (
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black ${isFinished ? 'text-slate-500' : 'text-slate-900'}`}>{lastStat?.score_home ?? 0}</span>
                <span className="text-slate-300 font-bold">-</span>
                <span className={`text-xl font-black ${isFinished ? 'text-slate-500' : 'text-slate-900'}`}>{lastStat?.score_away ?? 0}</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded">VS</span>
            )}
            <span className="text-[9px] text-slate-400 mt-1 font-medium text-center">
              {isLive ? 'Score Live' : isFinished ? 'Terminé' : match.start_time ? format(new Date(match.start_time), 'HH:mm') : '--:--'}
            </span>
          </div>

          <div className="flex flex-col items-center flex-1 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
              {match.away_team.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-center leading-tight min-h-[2rem] flex items-center font-bold text-slate-800">
              {match.away_team}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
         <div className="flex flex-col">
           <span className="text-[9px] text-slate-400 font-bold uppercase">Statut</span>
           <span className="text-[11px] font-bold text-slate-700">{match.status}</span>
         </div>
         {isFavoriteView ? (
           <div className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 shadow-sm">
              <span className="text-[10px] font-medium opacity-80">{data.bet_type || "1"}</span>
              <span className="text-sm font-bold">{data.initial_odd ? data.initial_odd.toFixed(2) : "1.00"}</span>
           </div>
         ) : (
           <button className="text-blue-600 hover:text-blue-800 transition-colors">
             <ChevronRight size={18} />
           </button>
         )}
      </div>
    </div>
  );
};

// --- MAIN APP ---

function App() {
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(MOCK_STATS);
  const [alerts, setAlerts] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  
  const [currentView, setCurrentView] = useState('favorites'); // favorites, ultra, alerts, leagues, matches
  const [matchStatusFilter, setMatchStatusFilter] = useState('LIVE'); // LIVE, UPCOMING, FINISHED
  const [selectedLeague, setSelectedLeague] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMock, setUsingMock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const [resStats, resFavs, resAlerts, resLeagues] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`, { signal: controller.signal }),
        fetch(`${API_URL}/dashboard/favorites-summary`, { signal: controller.signal }),
        fetch(`${API_URL}/matches/live/alerts?min_attacks=10`, { signal: controller.signal }),
        fetch(`${API_URL}/leagues`, { signal: controller.signal })
      ]);

      clearTimeout(timeoutId);

      if (!resStats.ok) throw new Error("API Indisponible");

      const sData = await resStats.json();
      const fData = await resFavs.json();
      const aData = await resAlerts.json();
      const lData = await resLeagues.json();

      setStats(sData);
      setFavorites(fData);
      setAlerts(aData.alerts || []);
      setLeagues(lData);
      setUsingMock(false);
    } catch (err) {
      setUsingMock(true);
      setFavorites(MOCK_FAVORITES);
      setStats(MOCK_STATS);
      setLeagues(MOCK_LEAGUES);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchesByStatus = async (status) => {
    setLoading(true);
    try {
      const endpoint = status === 'LIVE' ? 'live' : status === 'UPCOMING' ? 'upcoming' : 'finished';
      const res = await fetch(`${API_URL}/matches/${endpoint}`);
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      setAllMatches(data);
    } catch (err) {
      setAllMatches(MOCK_MATCHES.filter(m => m.status === status));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchTerm(query);
    if (currentView === 'matches' && query.length > 1) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/matches/search?q=${query}`);
        const data = await res.json();
        setAllMatches(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (currentView === 'matches') fetchMatchesByStatus(matchStatusFilter);
  }, [currentView, matchStatusFilter]);

  const filteredFavorites = useMemo(() => {
    let list = favorites;
    if (currentView === 'ultra') list = favorites.filter(f => f.initial_odd < 1.35);
    return list.filter(f => f.match.home_team.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [favorites, currentView, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white mr-3 shadow-lg shadow-blue-100">
            <Zap size={18} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">SmartBet 2.0</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Football Scraper</p>
          </div>
        </div>

        <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">Analyses</p>
          <SidebarItem icon={LayoutDashboard} label="Mes Favoris" active={currentView === 'favorites'} onClick={() => setCurrentView('favorites')} badge={stats.counters.favorites} />
          <SidebarItem icon={Flame} label="Ultra Favoris" active={currentView === 'ultra'} onClick={() => setCurrentView('ultra')} />
          <SidebarItem icon={Activity} label="Alertes Live" active={currentView === 'alerts'} onClick={() => setCurrentView('alerts')} badge={alerts.length} />
          
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Marché</p>
          <SidebarItem icon={PlayCircle} label="Tous les Matchs" active={currentView === 'matches'} onClick={() => setCurrentView('matches')} />
          <SidebarItem icon={Globe} label="Ligues" active={currentView === 'leagues'} onClick={() => setCurrentView('leagues')} badge={stats.counters.leagues} />
          
          <div className="mt-8 px-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
               <div className="flex items-center gap-2 mb-2">
                 <div className={`w-2 h-2 rounded-full ${usingMock ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                 <span className="text-xs font-medium">{usingMock ? 'Mode Démo' : 'API En ligne'}</span>
               </div>
            </div>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col md:ml-64 h-screen overflow-hidden">
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 bg-slate-100 rounded-lg"><Menu size={20} /></button>
            <h2 className="text-base font-bold text-slate-800">
              {currentView === 'favorites' ? 'Dashboard Favoris' : currentView === 'matches' ? 'Explorateur de Matchs' : currentView === 'leagues' ? 'Ligues' : 'Alertes'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Rechercher..." className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
            </div>
            <button onClick={fetchDashboard} className="p-2 rounded-full hover:bg-slate-100"><RefreshCw size={18} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* BARRE D'ONGLETS POUR L'EXPLORATEUR DE MATCHS */}
            {currentView === 'matches' && (
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-fit">
                {['LIVE', 'UPCOMING', 'FINISHED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setMatchStatusFilter(status)}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${matchStatusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {status === 'LIVE' ? 'En Direct' : status === 'UPCOMING' ? 'À Venir' : 'Terminés'}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatWidget label="En Direct" value={stats.counters.live} icon={Activity} colorClass="bg-red-500" />
              <StatWidget label="Favoris" value={stats.counters.favorites} icon={Trophy} colorClass="bg-blue-500" />
              <StatWidget label="À Venir" value={stats.counters.upcoming} icon={Calendar} colorClass="bg-emerald-500" />
              <StatWidget label="Analysés" value={stats.counters.total_matches} icon={Search} colorClass="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
              {loading ? (
                <div className="col-span-full py-20 text-center text-slate-400">Chargement des données...</div>
              ) : currentView === 'matches' ? (
                allMatches.map((m) => <MatchCard key={m.id} data={m} isFavoriteView={false} />)
              ) : currentView === 'leagues' ? (
                leagues.map((l) => (
                  <button key={l.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-blue-500 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Globe size={24} /></div>
                      <h4 className="font-bold text-slate-800">{l.name}</h4>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </button>
                ))
              ) : (
                filteredFavorites.map((fav, i) => <MatchCard key={i} data={fav} />)
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;