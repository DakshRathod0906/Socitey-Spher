import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Flat from "./models/Flat.js";
import Society from "./models/Society.js";
import { createComplaint, approveReopen, requestReopen, closeComplaint } from "./services/complaint/ComplaintService.js";
import { assignWorkOrder, startWorkOrder, resolveWorkOrder, cancelWorkOrder } from "./services/service/WorkOrderService.js";
import { initComplaintEvents } from "./services/events/ComplaintEvents.js";
import Complaint from "./models/Complaint.js";
import WorkOrder from "./models/WorkOrder.js";
import ComplaintHistory from "./models/ComplaintHistory.js";

dotenv.config();
initComplaintEvents();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Clean up past test data
    await Complaint.deleteMany({});
    await WorkOrder.deleteMany({});
    await ComplaintHistory.deleteMany({});

    // Find some actors
    const society = await Society.findOne();
    const admin = await User.findOne({ societyId: society._id, role: "society_admin" });
    const resident = await User.findOne({ societyId: society._id, role: "resident" });
    const staff = await User.findOne({ societyId: society._id, role: "service_staff" });
    const flat = await Flat.findOne({ societyId: society._id, _id: resident.flatId });

    if (!admin || !resident || !staff || !flat) {
      console.log("Required users not found. Make sure to run previous seeds.");
      process.exit(1);
    }

    console.log("\n--- Testing Complete Complaint Lifecycle ---");

    // 1. Resident creates complaint
    console.log("1. Resident creates complaint...");
    const complaint = await createComplaint({
      societyId: society._id,
      residentId: resident._id,
      flatId: flat._id,
      title: "Water leaking in bathroom",
      description: "There is a continuous leak from the tap.",
      category: "PLUMBING"
    });
    console.log(`Created: ${complaint.complaintNumber} - Status: ${complaint.status}`);

    // 2. Admin assigns work order
    console.log("\n2. Admin assigns work order to staff...");
    const workOrder1 = await assignWorkOrder({
      societyId: society._id,
      complaintId: complaint._id,
      assignedTo: staff._id,
      assignedBy: admin._id,
      assignedDepartment: "PLUMBING"
    });
    console.log(`WorkOrder Created: ${workOrder1._id} - Status: ${workOrder1.status}`);

    // 3. Staff starts work
    console.log("\n3. Staff starts work...");
    await startWorkOrder(workOrder1._id, staff._id);
    const updatedWO1 = await WorkOrder.findById(workOrder1._id);
    const updatedC1 = await Complaint.findById(complaint._id);
    console.log(`WorkOrder Status: ${updatedWO1.status} | Complaint Status: ${updatedC1.status}`);

    // 4. Staff resolves work
    console.log("\n4. Staff resolves work...");
    await resolveWorkOrder(workOrder1._id, staff._id, { resolutionNotes: "Fixed the washer." });
    const updatedC2 = await Complaint.findById(complaint._id);
    console.log(`WorkOrder Resolved | Complaint Status: ${updatedC2.status}`);

    // 5. Resident requests reopening
    console.log("\n5. Resident requests reopening...");
    await requestReopen(complaint._id, resident._id, "It is still leaking.");
    const updatedC3 = await Complaint.findById(complaint._id);
    console.log(`Complaint Status: ${updatedC3.status}`);

    // 6. Admin approves reopening
    console.log("\n6. Admin approves reopening...");
    await approveReopen(complaint._id, admin._id);
    const updatedC4 = await Complaint.findById(complaint._id);
    console.log(`Complaint Status: ${updatedC4.status}`);

    // 7. Admin assigns new work order
    console.log("\n7. Admin creates new WorkOrder for reassignment...");
    const workOrder2 = await assignWorkOrder({
      societyId: society._id,
      complaintId: complaint._id,
      assignedTo: staff._id,
      assignedBy: admin._id,
    });
    console.log(`New WorkOrder Created: ${workOrder2._id} - Status: ${workOrder2.status}`);

    // 8. Admin cancels the new work order (Testing cancellation)
    console.log("\n8. Admin cancels the new work order...");
    await cancelWorkOrder(workOrder2._id, admin._id, "Staff unavailable.");
    const updatedWO2 = await WorkOrder.findById(workOrder2._id);
    const updatedC5 = await Complaint.findById(complaint._id);
    console.log(`WorkOrder Status: ${updatedWO2.status} | Complaint Status: ${updatedC5.status}`);

    // 9. Admin assigns it AGAIN
    console.log("\n9. Admin assigns it AGAIN...");
    const workOrder3 = await assignWorkOrder({
      societyId: society._id,
      complaintId: complaint._id,
      assignedTo: staff._id,
      assignedBy: admin._id,
    });

    // 10. Staff resolves again
    console.log("\n10. Staff starts and resolves...");
    await startWorkOrder(workOrder3._id, staff._id);
    await resolveWorkOrder(workOrder3._id, staff._id, { resolutionNotes: "Replaced the entire tap." });
    const updatedC6 = await Complaint.findById(complaint._id);
    console.log(`Complaint Status: ${updatedC6.status}`);

    // 11. Resident accepts and closes
    console.log("\n11. Resident accepts and closes with feedback...");
    await closeComplaint(complaint._id, resident._id, { rating: 5, feedback: "Excellent job this time." });
    const finalC = await Complaint.findById(complaint._id);
    console.log(`Final Complaint Status: ${finalC.status}`);

    // Check history
    console.log("\n--- Checking History ---");
    const history = await ComplaintHistory.find({ complaintId: complaint._id }).sort({ createdAt: 1 });
    history.forEach(h => {
      console.log(`[${h.action}] -> New Status: ${h.newStatus} | By Role: ${h.performedRole} | Remarks: ${h.remarks}`);
    });

    console.log("\n✅ Lifecycle Test Passed!");
    process.exit(0);

  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
};

runTest();
