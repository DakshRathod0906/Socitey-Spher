
const test = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register-society", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        societyName: "Test Society",
        address: "123 Test St",
        city: "Test City",
        state: "Test State",
        pincode: "123456",
        adminName: "Test Admin",
        email: "testadmin@test.com",
        password: "password123",
        phone: "1234567890"
      })
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", data);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
};
test();
