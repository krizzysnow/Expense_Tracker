import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Login() {
  const [formData, setFormData] = useState({
    Email: "",
    Password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("[Login]  Submitting login form with:", {
        email: formData.Email,
        password: formData.Password ? "***" : "EMPTY"
      });

      const data = await authService.login(formData);

      console.log("[Login]  Backend response received:", {
        hasToken: !!data.token,
        tokenLength: data.token ? data.token.length : 0,
        tokenPreview: data.token ? data.token.substring(0, 50) : "NONE",
        user: data.user,
        fullResponse: data
      });

      // Handle different token field names from backend
      const tokenValue = data.token || data.access_token || data.accessToken;
      
      if (!tokenValue) {
        throw new Error("No token received from backend. Backend returned: " + JSON.stringify(data));
      }

      console.log("[Login]  Token found, saving to localStorage...");

      localStorage.setItem("token", tokenValue);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("[Login]  Token saved. Verification:");
      console.log("   Saved token length:", localStorage.getItem("token").length);
      console.log("   Saved token preview:", localStorage.getItem("token").substring(0, 50));
      console.log("   Saved token format starts with 'eyJ':", localStorage.getItem("token").startsWith("eyJ"));

      console.log("[Login]  Navigating to dashboard...");
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      console.error("[Login]  Error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subtitle">Enter your email and password</p>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="Email"
            name="Email"
            placeholder="Enter email"
            value={formData.Email}
            onChange={handleChange}
            required
            autoComplete="Email"
          />

          <input
            type="Password"
            name="Password"
            placeholder="Enter password"
            value={formData.Password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;