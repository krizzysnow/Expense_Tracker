import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiService from "../services/apiService";

function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    const verify = async () => {
      try {
        const response = await apiService._get(`/auth/verify/${token}`);
        setStatus("success");
        setMessage(response.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.message ||
            "Invalid or expired verification link. Please register again."
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center" }}>
        {status === "loading" && (
          <>
            <div
              style={{
                width: 52,
                height: 52,
                border: "4px solid rgba(99,102,241,0.2)",
                borderTop: "4px solid #6366f1",
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
                margin: "0 auto 24px"
              }}
            />
            <h2>Verifying your email…</h2>
            <p className="auth-subtitle">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: "#22c55e" }}>Email Verified!</h2>
            <p className="auth-subtitle">{message}</p>
            <Link to="/" className="auth-link-btn">
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 52, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: "#ef4444" }}>Verification Failed</h2>
            <p className="auth-subtitle">{message}</p>
            <Link to="/register" className="auth-link-btn">
              Register Again
            </Link>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .auth-link-btn {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          transition: opacity 0.2s;
        }
        .auth-link-btn:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}

export default VerifyEmail;
