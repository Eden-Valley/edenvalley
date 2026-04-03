import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDb } from "./lib/db";

// Initialize DB on app start
initDb();

createRoot(document.getElementById("root")!).render(<App />);
