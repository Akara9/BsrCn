import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      
        // You can add more SVGR options here        
      },
    }),
  ],
  base: '/v2/', // กำหนด basename
  server: {
    port: 5173, // กำหนด port ที่ต้องการ
  },
});
