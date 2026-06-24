import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { useThemeStore } from './store/themeStore';
import { Skeleton } from './components/ui/Skeleton';

// Route-level code splitting — keeps the initial bundle (and the heavy @pkmn
// chunks behind the team builder) out of the first load.
const HomePage = lazy(() => import('./routes/HomePage'));
const PokemonDetailPage = lazy(() => import('./routes/PokemonDetailPage'));
const ComparePage = lazy(() => import('./routes/ComparePage'));
const TeamsListPage = lazy(() => import('./routes/TeamsListPage'));
const TeamEditorPage = lazy(() => import('./routes/TeamEditorPage'));

function RouteFallback() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 py-8">
      <Skeleton className="h-10 w-64 mx-auto" />
      <Skeleton className="h-12 w-full max-w-xl mx-auto" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-4">
        {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
      </div>
    </div>
  );
}

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
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pokemon/:nameOrId" element={<PokemonDetailPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/teams" element={<TeamsListPage />} />
              <Route path="/teams/:id" element={<TeamEditorPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
