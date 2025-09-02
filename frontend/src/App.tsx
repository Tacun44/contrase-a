import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CredencialesPage from "./pages/CredencialesPage";
import { isAuthenticated } from "./utils/auth";

function PrivateRoute({ children }: { children: React.ReactElement }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route path="/credenciales" element={<CredencialesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
