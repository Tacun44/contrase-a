import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PasswordManagerPage from "./pages/PasswordManagerPage";
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
              <PasswordManagerPage />
            </PrivateRoute>
          }
        />
        <Route path="/manager" element={
          <PrivateRoute>
            <PasswordManagerPage />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
