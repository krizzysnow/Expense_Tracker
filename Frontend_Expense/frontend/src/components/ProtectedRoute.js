import React from "react";
import { Navigate } from "react-router-dom";

const isValidToken = (token) => {
  if (!token) return false;
  if (
    typeof token !== "string" ||
    token === "undefined" ||
    token === "null" ||
    !token.trim()
  ) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  return true;
};

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!isValidToken(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;