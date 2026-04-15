import apiService from "./apiService";

const normalizeAuthPayload = (data = {}) => ({
  name: data.name ?? data.Name ?? "",
  email: data.email ?? data.Email ?? "",
  password: data.password ?? data.Password ?? ""
});


const normalizeAuthResponse = (response) => {
  console.log("[authService] Normalizing response:", response);

  
  const token = 
    response.token || 
    response.access_token || 
    response.accessToken || 
    response.Authorization ||
    response.data?.token ||
    response.data?.access_token;


  const user = 
    response.user || 
    response.User || 
    response.data?.user ||
    response.data?.User || 
    {
      id: response.id || response.userId,
      email: response.email || response.Email,
      name: response.name || response.Name
    };

  console.log("[authService] Normalized response:", {
    tokenFound: !!token,
    tokenPreview: token ? `${token.substring(0, 30)}...` : "NOT FOUND",
    user: user
  });

  if (!token) {
    throw new Error(
      `No token found in backend response. Backend returned: ${JSON.stringify(response)}`
    );
  }

  return { token, user };
};

const authService = {
  login: async (credentials) => {
    const { email, password } = normalizeAuthPayload(credentials);

    console.log("[authService] Logging in with email:", email);

    const response = await apiService._post("/auth/login", {
      email: email.trim(),
      password
    });

    console.log("[authService] Login response received:", {
      hasToken: !!response.token,
      responseKeys: Object.keys(response)
    });

    
    return normalizeAuthResponse(response);
  },

  register: async (userData) => {
    const { name, email, password } = normalizeAuthPayload(userData);

    console.log("[authService] Registering with email:", email);

    const response = await apiService._post("/auth/register", {
      name: name.trim(),
      email: email.trim(),
      password
    });

    console.log("[authService] Register response received");

    return response;
  }
};

export default authService;
