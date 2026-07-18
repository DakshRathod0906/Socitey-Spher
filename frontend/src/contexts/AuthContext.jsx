import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { mapUser } from "../lib/responseMapper";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ss_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [tenant, setTenant] = useState(() => {
    const stored = localStorage.getItem("ss_tenant");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount — validate existing session with the backend
  useEffect(() => {
    const token = localStorage.getItem("ss_token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          const mappedUser = mapUser(res.data.user);
          const tenantData = res.data.tenant;
          setUser(mappedUser);
          setTenant(tenantData);
          localStorage.setItem("ss_user", JSON.stringify(mappedUser));
          if (tenantData) localStorage.setItem("ss_tenant", JSON.stringify(tenantData));
        })
        .catch(() => {
          // Token is invalid or expired (refresh also failed in the interceptor)
          localStorage.removeItem("ss_token");
          localStorage.removeItem("ss_refresh_token");
          localStorage.removeItem("ss_user");
          localStorage.removeItem("ss_tenant");
          setUser(null);
          setTenant(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, refreshToken } = res.data.tokens;
    localStorage.setItem("ss_token", accessToken);
    localStorage.setItem("ss_refresh_token", refreshToken);

    const mappedUser = mapUser(res.data.user);
    const tenantData = res.data.tenant;
    
    localStorage.setItem("ss_user", JSON.stringify(mappedUser));
    if (tenantData) localStorage.setItem("ss_tenant", JSON.stringify(tenantData));
    
    setUser(mappedUser);
    setTenant(tenantData);
    
    return { user: mappedUser, tenant: tenantData };
  }, []);

  const registerAdmin = useCallback(async (payload) => {
    const res = await api.post("/auth/register-admin", payload);
    // Do not set token or user because they need to verify email first
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ss_token");
    localStorage.removeItem("ss_refresh_token");
    localStorage.removeItem("ss_user");
    localStorage.removeItem("ss_tenant");
    setUser(null);
    setTenant(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      const mappedUser = mapUser(res.data.user);
      const tenantData = res.data.tenant;
      
      localStorage.setItem("ss_user", JSON.stringify(mappedUser));
      if (tenantData) localStorage.setItem("ss_tenant", JSON.stringify(tenantData));
      
      setUser(mappedUser);
      setTenant(tenantData);
      
      return { user: mappedUser, tenant: tenantData };
    } catch (error) {
      console.error("Failed to refresh user", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, tenant, loading, login, registerAdmin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
