// src/App.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import "./index.css";
import OfflineBanner from "./components/offlineBanner/OfflineBanner";

// import "carrot-kpi/switzer-font/";

const App = () => {
  return (
    <>
      <OfflineBanner />
      <Outlet />
    </>
  );
};

export default App;
