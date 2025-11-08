import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto' }} className="main-content">
          <Outlet />
        </main>
      </div>
      
      {/* Add CSS for responsive main content */}
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            width: 100% !important;
            padding-top: 4rem;
          }
        }
      `}</style>
    </>
  );
}

export default App;