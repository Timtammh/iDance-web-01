import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/analytics',outputDir:'test-results-analytics',use:{baseURL:'http://localhost:4173',channel:'chrome'},webServer:{command:'VITE_GA4_MEASUREMENT_ID=G-LOCALTEST npm run build && npm run preview -- --port 4173',url:'http://localhost:4173',reuseExistingServer:false},reporter:'list'});
