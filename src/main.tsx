import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { DataProvider } from './context';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataProvider>
    <ThemeProvider>
      <AppWrapper>
       
        <App />
       
      </AppWrapper>
    </ThemeProvider>
    </DataProvider>
  </StrictMode>,
);
