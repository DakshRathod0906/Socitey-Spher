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

describe("Validation and Edge Cases", () => {
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

  test("1. Missing visitorData returns error", async () => {
    const res = await request(app)
      .post("/api/visits")
      .set("Authorization", `Bearer ${residentToken}`)
      .send({
        flatId: flat._id.toString(),
        visitData: { expectedArrival: new Date(Date.now() + 3600000).toISOString() }
        // visitorData missing
      });

    assert.ok(res.status >= 400, `Expected error, got ${res.status}`);
  });

  test("2. Invalid respond status is rejected", async () => {
    // Create a gate request first
    const createRes = await request(app)
      .post("/api/visits/gate-request")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({
        flatId: flat._id.toString(),
        visitorData: { name: "Validation Test", phone: "+911111111111", visitorType: "GUEST" },
        visitData: {}
      });
    const gateVisitId = createRes.body.visit._id;

    // Try invalid status
    const res = await request(app)
      .patch(`/api/visits/${gateVisitId}/respond`)
      .set("Authorization", `Bearer ${residentToken}`)
      .send({ status: "INVALID_STATUS" });

    assert.ok(res.status >= 400, `Expected error for invalid status, got ${res.status}`);
  });

  test("3. Cannot approve an already approved visit (idempotent rejection)", async () => {
    // Create and approve a gate request
    const createRes = await request(app)
      .post("/api/visits/gate-request")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({
        flatId: flat._id.toString(),
        visitorData: { name: "Double Approve", phone: "+912222222222", visitorType: "GUEST" },
        visitData: {}
      });
    const gateVisitId = createRes.body.visit._id;

    // First approval
    const res1 = await request(app)
      .patch(`/api/visits/${gateVisitId}/respond`)
      .set("Authorization", `Bearer ${residentToken}`)
      .send({ status: "APPROVED" });
    assert.strictEqual(res1.status, 200);

    // Second approval attempt — visit is no longer PENDING
    const res2 = await request(app)
      .patch(`/api/visits/${gateVisitId}/respond`)
      .set("Authorization", `Bearer ${residentToken}`)
      .send({ status: "APPROVED" });
    assert.ok(res2.status >= 400, `Expected error for double approve, got ${res2.status}`);
  });

  test("4. Cannot cancel a checked-in visit", async () => {
    // Create pre-approved visit
    const createRes = await request(app)
      .post("/api/visits")
      .set("Authorization", `Bearer ${residentToken}`)
      .send({
        flatId: flat._id.toString(),
        visitorData: { name: "Cancel After Checkin", phone: "+913333333333", visitorType: "GUEST" },
        visitData: { expectedArrival: new Date(Date.now() + 3600000).toISOString() }
      });
    const visitId = createRes.body.visit._id;
    const rawToken = createRes.body.rawToken;

    // Check in
    await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({ qrToken: rawToken });

    // Try to cancel
    const res = await request(app)
      .patch(`/api/visits/${visitId}/cancel`)
      .set("Authorization", `Bearer ${residentToken}`);

    assert.ok(res.status >= 400, `Expected error for cancelling checked-in visit, got ${res.status}`);
  });

  test("5. Resident can reject a gate request", async () => {
    const createRes = await request(app)
      .post("/api/visits/gate-request")
      .set("Authorization", `Bearer ${securityToken}`)
      .send({
        flatId: flat._id.toString(),
        visitorData: { name: "Reject Test", phone: "+914444444444", visitorType: "DELIVERY" },
        visitData: {}
      });
    const gateVisitId = createRes.body.visit._id;

    const res = await request(app)
      .patch(`/api/visits/${gateVisitId}/respond`)
      .set("Authorization", `Bearer ${residentToken}`)
      .send({ status: "REJECTED" });

    assert.strictEqual(res.status, 200);

    const visit = await Visit.findById(gateVisitId);
    assert.strictEqual(visit.status, "REJECTED");
  });

  test("6. No auth token returns 401", async () => {
    const res = await request(app)
      .get("/api/visits");

    assert.strictEqual(res.status, 401);
  });
});
