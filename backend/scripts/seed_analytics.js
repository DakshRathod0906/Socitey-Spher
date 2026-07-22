import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import User from "../models/User.js";
import Society from "../models/Society.js";
import Flat from "../models/Flat.js";
import Complaint from "../models/Complaint.js";
import Expense from "../models/Expense.js";
import Visitor from "../models/Visitor.js";
import Vehicle from "../models/Vehicle.js";
import Notice from "../models/Notice.js";

dotenv.config();

const seedData = async () => {
  try {
    faker.seed(12345); // Reproducibility
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const societies = await Society.find();
    const residents = await User.find({ role: "resident" });
    const admins = await User.find({ role: "society_admin" });
    const flats = await Flat.find();

    if (societies.length === 0 || residents.length === 0 || flats.length === 0) {
      console.log("Not enough base data (societies, residents, flats) to seed. Exiting.");
      process.exit(1);
    }

    // 1. CLEAR COLLECTIONS BEFORE SEEDING
    console.log("Clearing existing synthetic collections...");
    await Complaint.deleteMany({});
    await Expense.deleteMany({});
    await Visitor.deleteMany({});
    await Vehicle.deleteMany({});
    await Notice.deleteMany({});
    console.log("Cleared.");

    const societyId = societies[0]._id;
    const adminId = admins.length > 0 ? admins[0]._id : residents[0]._id;

    // Seed Complaints
    console.log("Seeding Complaints...");
    const numComplaints = faker.number.int({ min: 75, max: 100 });
    const complaintDocs = [];
    const complaintStatuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
    const categories = ["PLUMBING", "ELECTRICAL", "LIFT", "CLEANING", "SECURITY", "PARKING", "GARDENING", "OTHER"];

    for (let i = 0; i < numComplaints; i++) {
      const resident = faker.helpers.arrayElement(residents);
      const flat = faker.helpers.arrayElement(flats);
      const status = faker.helpers.arrayElement(complaintStatuses);
      
      const createdAt = faker.date.recent({ days: 90 });
      let actualResolutionAt = null;
      let expectedResolutionAt = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
      
      if (status === "RESOLVED" || status === "CLOSED") {
        actualResolutionAt = faker.date.between({ from: createdAt, to: new Date() });
      }

      complaintDocs.push({
        societyId,
        residentId: resident._id,
        flatId: flat._id,
        complaintNumber: `CMP-2026-${String(i + 1).padStart(4, "0")}`,
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        category: faker.helpers.arrayElement(categories),
        priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        status,
        actualResolutionAt,
        expectedResolutionAt,
        createdAt,
      });
    }
    await Complaint.insertMany(complaintDocs);
    console.log(`Seeded ${numComplaints} Complaints`);

    // Seed Expenses
    console.log("Seeding Expenses...");
    const numExpenses = faker.number.int({ min: 40, max: 60 });
    const expenseDocs = [];
    const expenseCategories = ["MAINTENANCE", "UTILITIES", "SALARY", "SECURITY", "EVENT", "ADMINISTRATION", "REPAIR", "OTHER"];
    
    for (let i = 0; i < numExpenses; i++) {
      expenseDocs.push({
        societyId,
        title: faker.finance.transactionDescription(),
        category: faker.helpers.arrayElement(expenseCategories),
        amount: Number(faker.finance.amount({ min: 50, max: 5000 })),
        expenseDate: faker.date.recent({ days: 120 }),
        status: faker.helpers.arrayElement(["PENDING", "APPROVED", "REJECTED"]),
        recordedBy: adminId,
        createdAt: faker.date.recent({ days: 120 }),
      });
    }
    await Expense.insertMany(expenseDocs);
    console.log(`Seeded ${numExpenses} Expenses`);

    // Seed Visitors
    console.log("Seeding Visitors...");
    const numVisitors = faker.number.int({ min: 150, max: 250 });
    const visitorDocs = [];
    const visitorTypes = ["GUEST", "DELIVERY", "CAB", "SERVICE_PROVIDER", "MAINTENANCE", "EMERGENCY", "OTHER"];

    for (let i = 0; i < numVisitors; i++) {
      visitorDocs.push({
        societyId,
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        visitorType: faker.helpers.arrayElement(visitorTypes),
        createdByUserId: faker.helpers.arrayElement(residents)._id,
        createdAt: faker.date.recent({ days: 180 }),
      });
    }
    await Visitor.insertMany(visitorDocs);
    console.log(`Seeded ${numVisitors} Visitors`);

    // Seed Vehicles
    console.log("Seeding Vehicles...");
    const numVehicles = faker.number.int({ min: 40, max: 60 });
    const vehicleDocs = [];
    const vehicleTypes = ["TWO_WHEELER", "FOUR_WHEELER", "BICYCLE", "EV_TWO_WHEELER", "EV_FOUR_WHEELER", "OTHER"];

    for (let i = 0; i < numVehicles; i++) {
      const plate = faker.vehicle.vrm();
      vehicleDocs.push({
        societyId,
        ownerUserId: faker.helpers.arrayElement(residents)._id, // some random owners
        type: faker.helpers.arrayElement(vehicleTypes),
        licensePlate: plate,
        normalizedLicensePlate: plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
        status: faker.helpers.arrayElement(["ACTIVE", "INACTIVE", "ARCHIVED"]),
        createdAt: faker.date.recent({ days: 365 }),
      });
    }
    await Vehicle.insertMany(vehicleDocs);
    console.log(`Seeded ${numVehicles} Vehicles`);

    // Seed Notices
    console.log("Seeding Notices...");
    const numNotices = faker.number.int({ min: 15, max: 20 });
    const noticeDocs = [];

    for (let i = 0; i < numNotices; i++) {
      noticeDocs.push({
        societyId,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH"]),
        isPublished: faker.helpers.arrayElement([true, true, true, true, false]), // 80% published
        createdBy: adminId,
        createdAt: faker.date.recent({ days: 180 }),
      });
    }
    await Notice.insertMany(noticeDocs);
    console.log(`Seeded ${numNotices} Notices`);

    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
