import apiService from "./apiService";

const authService = {
  login: async (credentials) => {
    const email = (credentials.email ?? credentials.Email ?? "").trim();
    const password = credentials.password ?? credentials.Password ?? "";

    const response = await apiService._post("/auth/login", { email, password });

    const token =
      response.token || response.access_token || response.accessToken;

    if (!token) {
      throw new Error("No token received from backend.");
    }

    return {
      token,
      user: response.user || { email }
    };
  },

  register: async (userData) => {
    const name     = (userData.name     ?? userData.Name     ?? "").trim();
    const email    = (userData.email    ?? userData.Email    ?? "").trim();
    const password =  userData.password ?? userData.Password ?? "";

    const response = await apiService._post("/auth/register", { name, email, password });
    return response; // { message, email, emailSent, devOtp? }
  },

  verifyOTP: async (email, otp) => {
    const response = await apiService._post("/auth/verify-otp", { email, otp });
    return response;
  },

  resendOTP: async (email) => {
    const response = await apiService._post("/auth/resend-otp", { email });
    return response;
  }
};

export default authService;
