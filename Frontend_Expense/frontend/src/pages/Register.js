import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
function Register() {
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authService.register(formData);
      setSuccess("Account created successfully! Taking you to Login.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join to keep track of your expenses</p>
                {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-error" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderColor: "rgba(34, 197, 94, 0.2)" }}>{success}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="Name"
            placeholder="Full Name"
            value={formData.Name}
            onChange={handleChange}
            required
            autoComplete="Name"
          />

          <input
            type="Email"
            name="Email"
            placeholder="Email Address"
            value={formData.Email}
            onChange={handleChange}
            required
            autoComplete="Email"
          />

          <input
            type="Password"
            name="Password"
            placeholder="Choose Password"
            value={formData.Password}
            onChange={handleChange}
            required
            autoComplete="new-Password"
          />

          <button type="SUBMIT" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an Account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
