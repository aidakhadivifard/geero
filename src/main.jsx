import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import SparkPage from "./SparkPage.jsx";
import "./index.css";

// Tiny path router: /spark is the recipient view; everything else is the app.
const isSpark = window.location.pathname.replace(/\/+$/, "") === "/spark";

createRoot(document.getElementById("root")).render(
  <StrictMode>{isSpark ? <SparkPage /> : <App />}</StrictMode>
);
