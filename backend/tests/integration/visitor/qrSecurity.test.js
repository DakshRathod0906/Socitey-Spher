import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";

import app from "../../../app.js";
import { connectDatabase, closeDatabase } from "../../setup/database.js";
import { generateAuthToken } from "../../setup/auth.js";
import { createSociety, createTower, createFlat } from "../../setup/factories/societyFactory.js";
import { createResident } from "../../setup/factories/residentFactory.js";
import { createSecurity } from "../../setup/factories/securityFactory.js";
import Visit from "../../../models/Visit.js";

describe("QR Security", () => {
  let society, tower, flat, resident, security;
  let residentToken, securityToken;

  before(async () => {
    await connectDatabase();
    society = await createSociety();
    tower = await createTower(society._id);
    flat = await createFlat(society._id, tower._id);
    resident = await createResident(society._id, flat._id);
    security = await createSecurity(society._id);

    residentToken = generateAuthToken(resident);
    securityToken = generateAuthToken(security);
  });

  after(async () => {
    await closeDatabase();
  });

  // Helper: create an approved visit and return { visitId, rawToken }
  const createApprovedVisit = async (visitorName = "QR Test Visitor") => {
    const res = await request(app)
      .post("/api/visits")
      .set("Authorization", `Bearer ${residentToken}`)
      .send({
        flatId: flat._id.toString(),
        visitorData: { name: visitorName, phone: `+91${Date.now().toString().slice(-10)}`, visitorType: "GUEST" },
        visitData: { expectedArrival: new Date(Date.now() + 3600000).toISOString() }
      });
    return { visitId: res.body.visit._id, rawToken: res.body.rawToken };
  };

  test("1. Invalid QR token returns error", async () => {
    const res = await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({ qrToken: "completely-invalid-token-12345" });

    assert.ok([400, 404, 500].includes(res.status), `Expected error status, got ${res.status}`);
  });

  test("2. QR token reused after check-in is rejected", async () => {
    const { visitId, rawToken } = await createApprovedVisit("Reuse Test");

    // First check-in succeeds
    const res1 = await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({ qrToken: rawToken });
    assert.strictEqual(res1.status, 200);

    // Second check-in with same token is rejected
    const res2 = await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({ qrToken: rawToken });
    assert.ok(res2.status >= 400, `Expected error, got ${res2.status}`);

    // DB state should still be CHECKED_IN, not double-checked-in
    const visit = await Visit.findById(visitId);
    assert.strictEqual(visit.status, "CHECKED_IN");
  });

  test("3. QR token reused after full checkout is rejected", async () => {
    const { visitId, rawToken } = await createApprovedVisit("Checkout Reuse");

    // Check in
    await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({ qrToken: rawToken });

    // Check out
    await request(app)
      .post(`/api/visits/${visitId}/check-out`)
      .set("Authorization", `Bearer ${securityToken}`);

    // Try check-in again with same QR
    const res = await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({ qrToken: rawToken });
    assert.ok(res.status >= 400, `Expected error after checkout reuse, got ${res.status}`);
  });

  test("4. Cancelled visit QR token is rejected", async () => {
    const { visitId, rawToken } = await createApprovedVisit("Cancel Test");

    // Cancel the visit
    await request(app)
      .patch(`/api/visits/${visitId}/cancel`)
      .set("Authorization", `Bearer ${residentToken}`);

    // Verify cancel took effect
    const visit = await Visit.findById(visitId);
    assert.strictEqual(visit.status, "CANCELLED");

    // Try to check in with QR
    const res = await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({ qrToken: rawToken });
    assert.ok(res.status >= 400, `Expected error for cancelled visit, got ${res.status}`);
  });

  test("5. Expired visit QR token is rejected", async () => {
    const { visitId, rawToken } = await createApprovedVisit("Expire Test");

    // Manually expire the visit in the database
    await Visit.findByIdAndUpdate(visitId, {
      validUntil: new Date(Date.now() - 1000) // expired 1 second ago
    });

    const res = await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({ qrToken: rawToken });
    assert.ok(res.status >= 400, `Expected error for expired visit, got ${res.status}`);

    // Verify the visit was marked EXPIRED
    const visit = await Visit.findById(visitId);
    assert.strictEqual(visit.status, "EXPIRED");
  });

  test("6. Missing QR token returns error", async () => {
    const res = await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({});

    assert.ok(res.status >= 400, `Expected error for missing token, got ${res.status}`);
  });

  test("7. Checkout without prior check-in returns error", async () => {
    const { visitId } = await createApprovedVisit("No Checkin");

    const res = await request(app)
      .post(`/api/visits/${visitId}/check-out`)
      .set("Authorization", `Bearer ${securityToken}`);

    assert.ok(res.status >= 400, `Expected error for checkout without checkin, got ${res.status}`);
  });
});
