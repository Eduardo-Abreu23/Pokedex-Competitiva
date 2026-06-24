import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { useThemeStore } from './store/themeStore';
import HomePage from './routes/HomePage';
import PokemonDetailPage from './routes/PokemonDetailPage';
import ComparePage from './routes/ComparePage';
import TeamsListPage from './routes/TeamsListPage';
import TeamEditorPage from './routes/TeamEditorPage';

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 transition-colors">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pokemon/:nameOrId" element={<PokemonDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/teams" element={<TeamsListPage />} />
            <Route path="/teams/:id" element={<TeamEditorPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
