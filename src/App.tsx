import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import CustomCursor from "@/components/CustomCursor";
import Home from "./pages/Home";
import RoleChoice from "./pages/RoleChoice";
import FounderTest from "./pages/FounderTest";
import ResultPage from "./pages/ResultPage";
import Thanks from "./pages/Thanks";
import Funder from "./pages/Funder";
import FunderThanks from "./pages/FunderThanks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CustomCursor />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/role" element={<RoleChoice />} />
          <Route path="/test" element={<FounderTest />} />
          <Route path="/result/thinker" element={<ResultPage type="thinker" />} />
          <Route path="/result/doer" element={<ResultPage type="doer" />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/funder" element={<Funder />} />
          <Route path="/funder-thanks" element={<FunderThanks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
