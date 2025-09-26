// frontend/src/index.js (or main.js)
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Mount App into the #root element in public/index.html
const container = document.getElementById("root");

if (!container) {
  throw new Error(
    "Root container #root not found. Make sure public/index.html has <div id='root'></div>"
  );
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
