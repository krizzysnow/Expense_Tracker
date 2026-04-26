import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function VerifyOTP() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email || "";

  const [digits, setDigits]     = useState(["", "", "", "", "", ""]);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp]     = useState(location.state?.devOtp || "");

  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError("");

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0)  inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || "";
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.verifyOTP(email, otp);
      setSuccess("Email verified! Redirecting to login…");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");
    setDevOtp("");
    try {
      const res = await authService.resendOTP(email);
      setSuccess("A new OTP has been sent to your email.");
      setCountdown(60);
      if (res.devOtp) setDevOtp(res.devOtp);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const otpValue = digits.join("");

  return (
    <div className="auth-page">
      <div className="auth-card otp-card">
        {/* Icon */}
        <div className="otp-icon">✉️</div>

        <h2 className="otp-title">Verify Your Email</h2>
        <p className="auth-subtitle">
          We sent a 6-digit code to<br />
          <strong className="otp-email">{email}</strong>
        </p>

        {/* Dev banner */}
        {devOtp && (
          <div className="otp-dev-banner">
            <span>🔧 Dev mode — Email not configured</span>
            <span className="otp-dev-code">OTP: <strong>{devOtp}</strong></span>
          </div>
        )}

        {error   && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <form onSubmit={handleSubmit} className="auth-form otp-form">
          {/* 6 digit boxes */}
          <div className="otp-inputs" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                id={`otp-digit-${i}`}
                ref={(el) => (inputRefs.current[i] = el)}
                className={`otp-box${d ? " otp-box--filled" : ""}${error ? " otp-box--error" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button
            type="submit"
            className="otp-verify-btn"
            disabled={loading || otpValue.length < 6}
          >
            {loading ? (
              <span className="otp-spinner" />
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="otp-resend">
          <span>Didn't receive the code?</span>
          {countdown > 0 ? (
            <span className="otp-countdown">Resend in {countdown}s</span>
          ) : (
            <button
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Sending…" : "Resend OTP"}
            </button>
          )}
        </div>

        <p className="auth-footer">
          <button className="otp-back-btn" onClick={() => navigate("/register")}>
            ← Back to Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyOTP;
