class ApiService {
  constructor() {
    this.baseAPIPath = process.env.REACT_APP_API || "https://expense-tracker-gowq.onrender.com/api";
    // Debug logging only in development — never in production builds
    this.DEBUG = process.env.NODE_ENV !== "production";
  }

  log(prefix, message, data = null) {
    if (this.DEBUG) {
      console.log(`[${prefix}]`, message, data || "");
    }
  }

  error(prefix, message, error = null) {
    console.error(`[${prefix}]`, message, error || "");
  }

  _getHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };

    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null" && token.trim()) {
      headers.Authorization = `Bearer ${token}`;
      // Safe log — no token value or substring exposed
      this.log("AUTH", "Token added to headers");
    } else {
      this.log("AUTH", "No valid token found in localStorage");
    }

    return headers;
  }

  async _parseResponse(response) {
    if (response.status === 204) {
      this.log("PARSE", "204 No Content - returning null");
      return null;
    }

    const responseText = await response.text();

    if (!responseText) {
      this.log("PARSE", "Empty response - returning null");
      return null;
    }

    try {
      const data = JSON.parse(responseText);
      return data;
    } catch (parseError) {
      this.error("PARSE_ERROR", "Failed to parse JSON response", parseError);
      return responseText;
    }
  }

  async _get(url) {
    const fullUrl = `${this.baseAPIPath}${url}`;
    try {
      this.log("GET_START", `Fetching: ${url}`);
      const headers = this._getHeaders();
      const response = await fetch(fullUrl, { method: "GET", headers });

      this.log("GET_RESPONSE", `Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await this._parseResponse(response);
        const errorMessage =
          errorData?.message ||
          errorData?.error  ||
          errorData?.msg    ||
          `Request failed with status ${response.status}`;
        this.error("GET_ERROR", `[${response.status}] ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await this._parseResponse(response);
      this.log("GET_SUCCESS", `Response received for: ${url}`);
      return data;
    } catch (error) {
      this.error("GET_EXCEPTION", `Failed to GET ${url}`, error);
      throw error;
    }
  }

  async _post(url, payload) {
    const fullUrl = `${this.baseAPIPath}${url}`;
    try {
      this.log("POST_START", `Posting to: ${url}`);
      const headers = this._getHeaders();
      const response = await fetch(fullUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      this.log("POST_RESPONSE", `Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await this._parseResponse(response);
        const errorMessage =
          errorData?.message ||
          errorData?.error  ||
          errorData?.msg    ||
          `Request failed with status ${response.status}`;
        this.error("POST_ERROR", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await this._parseResponse(response);
      this.log("POST_SUCCESS", `Response received for: ${url}`);
      return data;
    } catch (error) {
      this.error("POST_EXCEPTION", `Failed to POST ${url}`, error);
      throw error;
    }
  }

  async _put(url, payload) {
    const fullUrl = `${this.baseAPIPath}${url}`;
    try {
      this.log("PUT_START", `Putting to: ${url}`);
      const headers = this._getHeaders();
      const response = await fetch(fullUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload)
      });

      this.log("PUT_RESPONSE", `Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await this._parseResponse(response);
        const errorMessage =
          errorData?.message ||
          errorData?.error  ||
          errorData?.msg    ||
          `Request failed with status ${response.status}`;
        this.error("PUT_ERROR", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await this._parseResponse(response);
      this.log("PUT_SUCCESS", `Response received for: ${url}`);
      return data;
    } catch (error) {
      this.error("PUT_EXCEPTION", `Failed to PUT ${url}`, error);
      throw error;
    }
  }

  async _delete(url) {
    const fullUrl = `${this.baseAPIPath}${url}`;
    try {
      this.log("DELETE_START", `Deleting: ${url}`);
      const headers = this._getHeaders();
      const response = await fetch(fullUrl, { method: "DELETE", headers });

      this.log("DELETE_RESPONSE", `Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await this._parseResponse(response);
        const errorMessage =
          errorData?.message ||
          errorData?.error  ||
          errorData?.msg    ||
          `Request failed with status ${response.status}`;
        this.error("DELETE_ERROR", errorMessage);
        throw new Error(errorMessage);
      }

      const data = await this._parseResponse(response);
      this.log("DELETE_SUCCESS", `Response received for: ${url}`);
      return data;
    } catch (error) {
      this.error("DELETE_EXCEPTION", `Failed to DELETE ${url}`, error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
