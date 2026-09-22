import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { HeaderHUD } from './components/layout/HeaderHUD';
import { LoadingScreen } from './components/layout/LoadingScreen';
import HomePage from './pages/HomePage';
import ArcadePage from './pages/ArcadePage';
import RankingPage from './pages/RankingPage';
import N8nFlowPage from './pages/N8nFlowPage';

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <GameProvider>
      <LoadingScreen done={!booting} />
      <BrowserRouter>
        <div className="app-shell">
          <HeaderHUD />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/nivel/:id" element={<ArcadePage />} />
              <Route path="/ranking" element={<RankingPage />} />
              <Route path="/flujo-n8n" element={<N8nFlowPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}