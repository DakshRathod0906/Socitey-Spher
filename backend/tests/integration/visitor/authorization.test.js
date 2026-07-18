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

describe("Authorization and Isolation", () => {
  let society1, society2;
  let flat1, flat2;
  let resident1, resident2;
  let security1, security2;
  let res1Token, res2Token, sec1Token, sec2Token;

  before(async () => {
    await connectDatabase();

    // Society 1 setup
    society1 = await createSociety();
    const tower1 = await createTower(society1._id);
    flat1 = await createFlat(society1._id, tower1._id);
    resident1 = await createResident(society1._id, flat1._id);
    security1 = await createSecurity(society1._id);

    // Society 2 setup
    society2 = await createSociety();
    const tower2 = await createTower(society2._id);
    flat2 = await createFlat(society2._id, tower2._id);
    resident2 = await createResident(society2._id, flat2._id);
    security2 = await createSecurity(society2._id);

    // Tokens
    res1Token = generateAuthToken(resident1);
    res2Token = generateAuthToken(resident2);
    sec1Token = generateAuthToken(security1);
    sec2Token = generateAuthToken(security2);
  });

  after(async () => {
    await closeDatabase();
  });

  let visitId1, rawToken1;

  test("1. Resident creates visit in Society 1", async () => {
    const res = await request(app)
      .post("/api/visits")
      .set("Authorization", `Bearer ${res1Token}`)
      .send({
        flatId: flat1._id.toString(),
        visitorData: { name: "Cross Tenant Test", phone: "+911234567890", visitorType: "GUEST" },
        visitData: { expectedArrival: new Date(Date.now() + 3600000).toISOString() }
      });
    
    assert.strictEqual(res.status, 201);
    visitId1 = res.body.visit._id;
    rawToken1 = res.body.rawToken;
  });

  test("2. Security from Society 2 cannot check in Society 1's visit", async () => {
    const res = await request(app)
      .post("/api/visits/check-in")
      .set("Authorization", `Bearer ${sec2Token}`)
      .send({ qrToken: rawToken1 });

    assert.ok(res.status >= 400, `Expected error status, got ${res.status}`);
  });

  test("3. Security from Society 2 cannot view Society 1's visits", async () => {
    const res = await request(app)
      .get("/api/visits")
      .set("Authorization", `Bearer ${sec2Token}`);

    assert.strictEqual(res.status, 200);
    // Should return empty list because sec2 has no visits in society2
    assert.strictEqual(res.body.length, 0);
  });

  test("4. Security cannot create a pre-approved pass", async () => {
    const res = await request(app)
      .post("/api/visits")
      .set("Authorization", `Bearer ${sec1Token}`)
      .send({
        flatId: flat1._id.toString(),
        visitorData: { name: "Security Creation", phone: "+919999999999", visitorType: "GUEST" },
        visitData: {}
      });

    assert.strictEqual(res.status, 403, "Expected 403 Forbidden");
  });

  test("5. Resident cannot create a walk-in gate request", async () => {
    const res = await request(app)
      .post("/api/visits/gate-request")
      .set("Authorization", `Bearer ${res1Token}`)
      .send({
        flatId: flat1._id.toString(),
        visitorData: { name: "Resident Walk-in", phone: "+918888888888", visitorType: "DELIVERY" },
        visitData: {}
      });

    assert.strictEqual(res.status, 403, "Expected 403 Forbidden");
  });

  test("6. Resident 2 cannot respond to Resident 1's gate request", async () => {
    // Sec 1 creates gate request for Flat 1
    const createRes = await request(app)
      .post("/api/visits/gate-request")
      .set("Authorization", `Bearer ${sec1Token}`)
      .send({
        flatId: flat1._id.toString(),
        visitorData: { name: "Gate Req Test", phone: "+917777777777", visitorType: "DELIVERY" },
        visitData: {}
      });

    const gateVisitId = createRes.body.visit._id;

    // Res 2 tries to respond
    const res = await request(app)
      .patch(`/api/visits/${gateVisitId}/respond`)
      .set("Authorization", `Bearer ${res2Token}`)
      .send({ status: "APPROVED" });

    assert.ok(res.status >= 400, `Expected error, got ${res.status}`);
  });
});
