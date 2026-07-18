const testSocietyAdmin = async () => {
  try {
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "testadmin@test.com", password: "password123" })
    });
    
    if (!loginRes.ok) {
      console.log("LOGIN FAILED:", loginRes.status, await loginRes.text());
      return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.tokens.accessToken;
    console.log("LOGIN SUCCESS! Token length:", token.length);
    
    // Add a tower
    const addRes = await fetch("http://localhost:5000/api/societies/towers", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Tower A", totalFloors: 10 })
    });
    console.log("ADD TOWER STATUS:", addRes.status, await addRes.text());

    // Get towers
    const getRes = await fetch("http://localhost:5000/api/societies/towers", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("GET TOWERS STATUS:", getRes.status, await getRes.text());
  } catch (err) {
    console.error("ERROR:", err.message);
  }
};
testSocietyAdmin();
