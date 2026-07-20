import test from "node:test";
import assert from "node:assert";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js"; // Needs to export app
import Society from "../models/Society.js";
import User from "../models/User.js";
import Flat from "../models/Flat.js";
import Complaint from "../models/Complaint.js";
import WorkOrder from "../models/WorkOrder.js";
import jwt from "jsonwebtoken";

let mongoServer;
let societyId;
let adminToken, residentToken, staffToken;
let residentId, staffId;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Setup mock data
  const society = await Society.create({
    name: "Test Society",
    address: "123 Test St",
    registrationNumber: "REG123",
    status: "ACTIVE"
  });
  societyId = society._id;

  const flat = await Flat.create({
    societyId,
    flatNumber: "A-101",
    towerId: new mongoose.Types.ObjectId()
  });

  const admin = await User.create({
    name: "Admin",
    email: "admin@test.com",
    password: "password123",
    role: "society_admin",
    societyId,
    accountStatus: "ACTIVE"
  });

  const resident = await User.create({
    name: "Resident",
    email: "resident@test.com",
    password: "password123",
    role: "resident",
    societyId,
    flatId: flat._id,
    accountStatus: "ACTIVE"
  });
  residentId = resident._id;

  const staff = await User.create({
    name: "Staff",
    email: "staff@test.com",
    password: "password123",
    role: "service_staff",
    societyId,
    accountStatus: "ACTIVE",
    serviceCategory: "PLUMBING"
  });
  staffId = staff._id;

  adminToken = jwt.sign({ userId: admin._id, role: admin.role, societyId }, process.env.JWT_SECRET || "test-secret");
  residentToken = jwt.sign({ userId: resident._id, role: resident.role, societyId }, process.env.JWT_SECRET || "test-secret");
  staffToken = jwt.sign({ userId: staff._id, role: staff.role, societyId }, process.env.JWT_SECRET || "test-secret");
});

test.after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test.afterEach(async () => {
  await Complaint.deleteMany({});
  await WorkOrder.deleteMany({});
});

test("Comprehensive Complaint Flow", async (t) => {
  let complaintId;

  await t.test("1. Resident creates a complaint (Happy Path)", async () => {
    const res = await request(app)
      .post("/api/complaints")
      .set("Authorization", `Bearer ${residentToken}`)
      .send({
        title: "Test Complaint",
        description: "Test Description",
        category: "PLUMBING"
      });
    
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.status, "OPEN");
    complaintId = res.body.data._id;
  });

  await t.test("2. Staff cannot assign a complaint (RBAC Violation)", async () => {
    const res = await request(app)
      .post("/api/work-orders")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ complaintId, assignedTo: staffId, assignedDepartment: "PLUMBING" });
    
    assert.strictEqual(res.status, 403);
  });

  let workOrderId;
  await t.test("3. Admin assigns complaint to staff (Happy Path)", async () => {
    const res = await request(app)
      .post("/api/work-orders")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ complaintId, assignedTo: staffId, assignedDepartment: "PLUMBING" });
    
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.data.status, "ASSIGNED");
    workOrderId = res.body.data._id;

    const complaint = await Complaint.findById(complaintId);
    assert.strictEqual(complaint.status, "ASSIGNED");
  });

  await t.test("4. Resident cannot cancel an assigned complaint (Invalid State)", async () => {
    const res = await request(app)
      .post(`/api/complaints/${complaintId}/cancel`)
      .set("Authorization", `Bearer ${residentToken}`);
    
    assert.strictEqual(res.status, 400); // Because status is ASSIGNED, not OPEN
  });

  await t.test("5. Staff starts work order (Happy Path)", async () => {
    const res = await request(app)
      .patch(`/api/work-orders/${workOrderId}/start`)
      .set("Authorization", `Bearer ${staffToken}`);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, "IN_PROGRESS");
    
    const complaint = await Complaint.findById(complaintId);
    assert.strictEqual(complaint.status, "IN_PROGRESS");
  });

  await t.test("6. Staff resolves work order (Happy Path)", async () => {
    const res = await request(app)
      .patch(`/api/work-orders/${workOrderId}/resolve`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ resolutionNotes: "Fixed" });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, "RESOLVED");

    const complaint = await Complaint.findById(complaintId);
    assert.strictEqual(complaint.status, "RESOLVED");
  });

  await t.test("7. Resident requests reopen (Happy Path)", async () => {
    const res = await request(app)
      .post(`/api/complaints/${complaintId}/request-reopen`)
      .set("Authorization", `Bearer ${residentToken}`)
      .send({ reason: "Not fixed completely" });
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, "REOPEN_REQUESTED");
  });

  await t.test("8. Admin approves reopen (Happy Path)", async () => {
    const res = await request(app)
      .post(`/api/complaints/${complaintId}/approve-reopen`)
      .set("Authorization", `Bearer ${adminToken}`);
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.status, "OPEN"); // Back to open
  });
});
