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
            
            {/* Product Hunt Badge - Bottom Right */}
            <a 
              href="https://www.producthunt.com/posts/eden-valley" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="fixed bottom-6 right-6 z-50 opacity-60 hover:opacity-100 transition-opacity"
              title="Eden Valley on Product Hunt"
            >
              <img 
                alt="Eden Valley on Product Hunt" 
                width="160" 
                height="35" 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1119303&theme=dark&t=1775713183398"
              />
            </a>
            
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
