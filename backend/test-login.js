const testLogin = async () => {
  try {
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "superadmin@societysphere.com", password: "SuperPassword123!" })
    });
    
    if (!loginRes.ok) {
      console.log("LOGIN FAILED:", loginRes.status, await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    console.log("LOGIN SUCCESS! Token:", loginData.tokens.accessToken.substring(0, 15) + "...");
    
    const dashRes = await fetch("http://localhost:5000/api/dashboard/super-admin", {
      headers: { "Authorization": `Bearer ${loginData.tokens.accessToken}` }
    });
    
    console.log("DASHBOARD STATUS:", dashRes.status);
    console.log("DASHBOARD RESPONSE:", await dashRes.text());
  } catch (err) {
    console.error("ERROR:", err.message);
  }
};
testLogin();
