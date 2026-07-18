import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../../app.js";
import { connectDatabase, closeDatabase, clearDatabase } from "../../setup/database.js";
import { generateAuthToken } from "../../setup/auth.js";
import { createSociety, createTower, createFlat } from "../../setup/factories/societyFactory.js";
import { createResident } from "../../setup/factories/residentFactory.js";
import { createSecurity } from "../../setup/factories/securityFactory.js";
import Visit from "../../../models/Visit.js";
import Visitor from "../../../models/Visitor.js";

describe("Visitor Management Lifecycle", () => {
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

  describe("Pre-approved Visit Lifecycle", () => {
    let visitId;
    let rawToken;
    let visitorId;

    test("1. Resident successfully creates a pre-approved visit", async () => {
      const payload = {
        flatId: flat._id.toString(),
        visitorData: {
          name: "Alice Preapproved",
          phone: "+919876543210",
          visitorType: "GUEST"
        },
        visitData: {
          expectedArrival: new Date(Date.now() + 3600000).toISOString()
        }
      };

      const res = await request(app)
        .post("/api/visits")
        .set("Authorization", `Bearer ${residentToken}`)
        .send(payload);

      assert.strictEqual(res.status, 201);
      // Controller spreads { visit, rawToken, visitor } into the response
      assert.strictEqual(res.body.visit.status, "APPROVED");
      assert.ok(res.body.rawToken, "rawToken should be returned for QR generation");

      visitId = res.body.visit._id;
      rawToken = res.body.rawToken;

      // Verify Database Side Effects
      const visit = await Visit.findById(visitId);
      assert.ok(visit);
      assert.strictEqual(visit.status, "APPROVED");
      assert.strictEqual(visit.approvalMode, "AUTO");
      assert.strictEqual(visit.createdByUserId.toString(), resident._id.toString());
      assert.ok(visit.qrTokenHash, "qrTokenHash should be stored in DB");
      
      visitorId = visit.visitorId;
      const visitor = await Visitor.findById(visitorId);
      assert.ok(visitor);
      assert.strictEqual(visitor.name, "Alice Preapproved");
      assert.strictEqual(visitor.phone, "+919876543210");
    });

    test("2. Security successfully checks in the pre-approved visitor", async () => {
      const res = await request(app)
        .post("/api/visits/check-in")
        .set("Authorization", `Bearer ${securityToken}`)
        .send({ qrToken: rawToken });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.visit.status, "CHECKED_IN");

      // Verify Database Side Effects
      const visit = await Visit.findById(visitId);
      assert.strictEqual(visit.status, "CHECKED_IN");
      assert.ok(visit.checkInTime);
      assert.strictEqual(visit.securityCheckInUserId.toString(), security._id.toString());
    });

    test("3. Security successfully checks out the pre-approved visitor", async () => {
      const res = await request(app)
        .post(`/api/visits/${visitId}/check-out`)
        .set("Authorization", `Bearer ${securityToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.visit.status, "CHECKED_OUT");

      // Verify Database Side Effects
      const visit = await Visit.findById(visitId);
      assert.strictEqual(visit.status, "CHECKED_OUT");
      assert.ok(visit.checkOutTime);
      assert.strictEqual(visit.securityCheckOutUserId.toString(), security._id.toString());
      assert.ok(visit.checkInTime.getTime() <= visit.checkOutTime.getTime(), "Check-in time must be before check-out time");
    });

  });

  describe("Walk-in Gate Request Lifecycle", () => {
    let visitId;
    let walkinRawToken;

    test("1. Security creates a pending gate request for walk-in", async () => {
      const payload = {
        flatId: flat._id.toString(),
        visitorData: {
          name: "Bob Walkin",
          phone: "+919876543211",
          visitorType: "DELIVERY"
        },
        visitData: {}
      };

      const res = await request(app)
        .post("/api/visits/gate-request")
        .set("Authorization", `Bearer ${securityToken}`)
        .send(payload);

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.visit.status, "PENDING");
      
      visitId = res.body.visit._id;

      // Verify Database Side Effects
      const visit = await Visit.findById(visitId);
      assert.strictEqual(visit.status, "PENDING");
      assert.strictEqual(visit.approvalMode, "MANUAL");
      assert.strictEqual(visit.createdByUserId.toString(), security._id.toString());
      // No qrTokenHash yet — generated on approval
      assert.ok(!visit.qrTokenHash, "No QR token before approval");
    });

    test("2. Resident approves the gate request", async () => {
      const res = await request(app)
        .patch(`/api/visits/${visitId}/respond`)
        .set("Authorization", `Bearer ${residentToken}`)
        .send({ status: "APPROVED" });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.visit.status, "APPROVED");
      assert.ok(res.body.rawToken, "rawToken should be generated on approval");

      walkinRawToken = res.body.rawToken;

      // Verify Database Side Effects
      const visit = await Visit.findById(visitId);
      assert.strictEqual(visit.status, "APPROVED");
      assert.ok(visit.qrTokenHash, "qrTokenHash should now exist after approval");
    });

    test("3. Security checks in the approved walk-in visitor", async () => {
      const res = await request(app)
        .post("/api/visits/check-in")
        .set("Authorization", `Bearer ${securityToken}`)
        .send({ qrToken: walkinRawToken });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.visit.status, "CHECKED_IN");

      // Verify Database Side Effects
      const visitAfter = await Visit.findById(visitId);
      assert.strictEqual(visitAfter.status, "CHECKED_IN");
      assert.ok(visitAfter.checkInTime);
      assert.strictEqual(visitAfter.securityCheckInUserId.toString(), security._id.toString());
    });

    test("4. Security checks out the walk-in visitor", async () => {
      const res = await request(app)
        .post(`/api/visits/${visitId}/check-out`)
        .set("Authorization", `Bearer ${securityToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.visit.status, "CHECKED_OUT");

      // Verify Database Side Effects
      const visit = await Visit.findById(visitId);
      assert.strictEqual(visit.status, "CHECKED_OUT");
      assert.ok(visit.checkOutTime);
      assert.ok(visit.checkInTime.getTime() <= visit.checkOutTime.getTime(), "Check-in time must be before check-out time");
    });
  });
});
