import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { generateSeedData } from "@/utils/seedData";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Seed demo data on first load
generateSeedData();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryProvider>,
);
