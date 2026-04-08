import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AudioProvider } from "@/hooks/AudioContext";
import LoadingScreen from "@/components/LoadingScreen";
import Home from "./pages/Home";
import RoleChoice from "./pages/RoleChoice";
import FounderTest from "./pages/FounderTest";
import ResultPage from "./pages/ResultPage";
import Thanks from "./pages/Thanks";
import Funder from "./pages/Funder";
import FunderThanks from "./pages/FunderThanks";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import CustomCursor from "./components/CustomCursor";

const queryClient = new QueryClient();

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AudioProvider>
            <CustomCursor />
            {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/role" element={<RoleChoice />} />
                <Route path="/test" element={<FounderTest />} />
                <Route path="/result/thinker" element={<ResultPage type="thinker" />} />
                <Route path="/result/doer" element={<ResultPage type="doer" />} />
                <Route path="/thanks" element={<Thanks />} />
                <Route path="/funder" element={<Funder />} />
                <Route path="/funder-thanks" element={<FunderThanks />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AudioProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
