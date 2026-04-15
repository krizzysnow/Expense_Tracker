class ApiService {
  constructor() {
    this.baseAPIPath = process.env.REACT_APP_API || "http://localhost:5000/api";
    this.DEBUG = true; 
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
      this.log("AUTH", "✅ Token added to headers", {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20),
        tokenFormat: token.startsWith("eyJ") ? "JWT (valid format)" : "NOT JWT format - WARNING!",
        headerValue: `Bearer ${token.substring(0, 30)}...`
      });
    } else {
      this.log("AUTH", "❌ No valid token found in localStorage", {
        token: token,
        isUndefined: token === "undefined",
        isNull: token === "null"
      });
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
      this.error("RAW_RESPONSE", responseText);
      
      return responseText;
    }
  }

  
 
  async _get(url) {
    const fullUrl = `${this.baseAPIPath}${url}`;

    try {
      this.log("GET_START", `Fetching from: ${fullUrl}`);

      const headers = this._getHeaders();
      this.log("GET_HEADERS", "Request headers:", headers);

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: headers
      });

      this.log("GET_RESPONSE", `Status: ${response.status} ${response.statusText}`);

  
      if (!response.ok) {
        const errorData = await this._parseResponse(response);
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          errorData?.msg ||
          `Request failed with status ${response.status}`;

        this.error("GET_ERROR", `[${response.status}] ${errorMessage}`, {
          fullErrorResponse: errorData,
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(errorMessage);
      }

      const data = await this._parseResponse(response);
      this.log("GET_SUCCESS", "Response data:", data);

      return data;
    } catch (error) {
      this.error("GET_EXCEPTION", `Failed to GET ${url}`, error);
      throw error;
    }
  }

 
  async _post(url, payload) {
    const fullUrl = `${this.baseAPIPath}${url}`;

    try {
      this.log("POST_START", `Posting to: ${fullUrl}`);
      this.log("POST_PAYLOAD", "Request body:", payload);

      const headers = this._getHeaders();
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });

      this.log("POST_RESPONSE", `Status: ${response.status} ${response.statusText}`);

   
      if (!response.ok) {
        const errorData = await this._parseResponse(response);
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          errorData?.msg ||
          `Request failed with status ${response.status}`;

        this.error("POST_ERROR", errorMessage, errorData);
        throw new Error(errorMessage);
      }

    
      const data = await this._parseResponse(response);
      this.log("POST_SUCCESS", "Response data:", data);

      return data;
    } catch (error) {
      this.error("POST_EXCEPTION", `Failed to POST ${url}`, error);
      throw error;
    }
  }

  
  async _put(url, payload) {
    const fullUrl = `${this.baseAPIPath}${url}`;

    try {
      this.log("PUT_START", `Putting to: ${fullUrl}`);
      this.log("PUT_PAYLOAD", "Request body:", payload);

      const headers = this._getHeaders();
      const response = await fetch(fullUrl, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(payload)
      });

      this.log("PUT_RESPONSE", `Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await this._parseResponse(response);
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          errorData?.msg ||
          `Request failed with status ${response.status}`;

        this.error("PUT_ERROR", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const data = await this._parseResponse(response);
      this.log("PUT_SUCCESS", "Response data:", data);

      return data;
    } catch (error) {
      this.error("PUT_EXCEPTION", `Failed to PUT ${url}`, error);
      throw error;
    }
  }

  async _delete(url) {
    const fullUrl = `${this.baseAPIPath}${url}`;

    try {
      this.log("DELETE_START", `Deleting: ${fullUrl}`);

      const headers = this._getHeaders();
      const response = await fetch(fullUrl, {
        method: "DELETE",
        headers: headers
      });

      this.log("DELETE_RESPONSE", `Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await this._parseResponse(response);
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          errorData?.msg ||
          `Request failed with status ${response.status}`;

        this.error("DELETE_ERROR", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const data = await this._parseResponse(response);
      this.log("DELETE_SUCCESS", "Response data:", data);

      return data;
    } catch (error) {
      this.error("DELETE_EXCEPTION", `Failed to DELETE ${url}`, error);
      throw error;
    }

    
  }
}

const apiService = new ApiService();
export default apiService;
