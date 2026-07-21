import mongoose from "mongoose";
import dotenv from "dotenv";
import * as AmenityService from "./services/amenity/AmenityService.js";
import * as BookingService from "./services/amenity/BookingService.js";
import * as VehicleService from "./services/parking/VehicleService.js";
import * as ParkingSlotService from "./services/parking/ParkingSlotService.js";
import Society from "./models/Society.js";
import User from "./models/User.js";
import Amenity from "./models/Amenity.js";
import Booking from "./models/Booking.js";
import Vehicle from "./models/Vehicle.js";
import ParkingSlot from "./models/ParkingSlot.js";

dotenv.config();

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ ${message}`);
};

const runTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("--- MongoDB Connected ---");

    // 1. Setup Mock Data
    let society = await Society.findOneAndUpdate(
      { name: "Parking Amenity Test Society" },
      { $set: { societyCode: "PAT123", address: "Test", city: "Test", state: "Test", pincode: "123", registrationNumber: "PAT123", contactEmail: "pat@test.com", status: "ACTIVE" } },
      { upsert: true, new: true }
    );

    const admin = await User.findOneAndUpdate(
      { email: "admin_pat@test.com" },
      { $set: { societyId: society._id, name: "Admin", password: "pwd", role: "society_admin" } },
      { upsert: true, new: true }
    );

    const resident = await User.findOneAndUpdate(
      { email: "res_pat@test.com" },
      { $set: { societyId: society._id, name: "Resident", password: "pwd", role: "resident" } },
      { upsert: true, new: true }
    );

    // Clean DB
    await Amenity.deleteMany({ societyId: society._id });
    await Booking.deleteMany({ societyId: society._id });
    await Vehicle.deleteMany({ societyId: society._id });
    await ParkingSlot.deleteMany({ societyId: society._id });

    console.log("\n--- AMENITIES TESTS ---");

    // Create Amenity
    const gym = await AmenityService.createAmenity({
      name: "Gym",
      capacity: 2,
      openTime: "06:00",
      closeTime: "22:00",
      slotDurationMinutes: 60
    }, society._id);
    assert(gym.capacity === 2, "Create amenity");

    // Update Amenity
    const updatedGym = await AmenityService.updateAmenity(gym._id, { description: "Updated Gym" }, society._id);
    assert(updatedGym.description === "Updated Gym", "Update amenity");

    // List Amenities
    const amenities = await AmenityService.listAmenities(society._id, true);
    assert(amenities.length === 1, "List amenities");

    // Booking Creation (Valid)
    const b1 = await BookingService.createBooking({
      societyId: society._id,
      residentId: resident._id,
      amenityId: gym._id,
      bookingDate: "2030-01-01",
      startTime: "10:00",
      endTime: "11:00"
    });
    assert(b1.status === "CONFIRMED", "Booking creation within capacity");

    // Overlap within capacity
    const b2 = await BookingService.createBooking({
      societyId: society._id,
      residentId: resident._id,
      amenityId: gym._id,
      bookingDate: "2030-01-01",
      startTime: "10:30",
      endTime: "11:30"
    });
    assert(b2.status === "CONFIRMED", "Overlap within capacity allowed");

    // Overlap exceeding capacity
    try {
      await BookingService.createBooking({
        societyId: society._id,
        residentId: resident._id,
        amenityId: gym._id,
        bookingDate: "2030-01-01",
        startTime: "10:15",
        endTime: "11:15"
      });
      assert(false, "Overlap exceeding capacity should fail");
    } catch (e) {
      assert(e.message.includes("fully booked"), "Overlap exceeding capacity rejected");
    }

    // Booking cancellation
    await BookingService.cancelBooking(b2._id, resident._id, "resident");
    const cancelledB2 = await Booking.findById(b2._id);
    assert(cancelledB2.status === "CANCELLED", "Booking cancellation");

    // After cancellation, capacity should free up
    const b3 = await BookingService.createBooking({
      societyId: society._id,
      residentId: resident._id,
      amenityId: gym._id,
      bookingDate: "2030-01-01",
      startTime: "10:15",
      endTime: "11:15"
    });
    assert(b3.status === "CONFIRMED", "Capacity freed up after cancellation");

    // Outside-hours rejection
    try {
      await BookingService.createBooking({
        societyId: society._id, residentId: resident._id, amenityId: gym._id, bookingDate: "2030-01-01", startTime: "05:00", endTime: "06:00"
      });
      assert(false, "Outside hours should fail");
    } catch (e) {
      assert(e.message.includes("operating hours"), "Outside-hours rejected");
    }

    // Invalid duration rejection
    try {
      await BookingService.createBooking({
        societyId: society._id, residentId: resident._id, amenityId: gym._id, bookingDate: "2030-01-01", startTime: "12:00", endTime: "12:30"
      });
      assert(false, "Invalid duration should fail");
    } catch (e) {
      assert(e.message.includes("Minimum booking duration"), "Invalid duration rejected");
    }


    console.log("\n--- PARKING TESTS ---");

    // Register vehicle
    const v1 = await VehicleService.registerVehicle({
      type: "FOUR_WHEELER",
      licensePlate: "GJ-01-AB-1234",
    }, society._id, resident._id);
    assert(v1.normalizedLicensePlate === "GJ01AB1234", "Register vehicle and normalize plate");

    // Duplicate plate rejection
    try {
      await VehicleService.registerVehicle({
        type: "FOUR_WHEELER", licensePlate: "GJ 01 AB 1234",
      }, society._id, resident._id);
      assert(false, "Duplicate plate should fail");
    } catch (e) {
      assert(e.message.includes("already registered"), "Duplicate plate rejection");
    }

    // Create parking slots
    const s1 = await ParkingSlotService.createSlot({ slotNumber: "P-101", slotType: "resident" }, society._id);
    const s2 = await ParkingSlotService.createSlot({ slotNumber: "P-102", slotType: "visitor" }, society._id);
    assert(s1.status === "AVAILABLE", "Create parking slots");

    // Allocate slot
    const allocatedS1 = await ParkingSlotService.allocateSlot(s1._id, resident._id, v1._id, society._id);
    assert(allocatedS1.status === "ALLOCATED" && allocatedS1.allocatedTo.toString() === resident._id.toString(), "Allocate slot");

    // Prevent duplicate allocation (vehicle already assigned)
    try {
      await ParkingSlotService.allocateSlot(s2._id, resident._id, v1._id, society._id);
      assert(false, "Vehicle double allocation should fail");
    } catch (e) {
      assert(e.message.includes("already allocated"), "Prevent duplicate vehicle allocation");
    }

    // Update occupancy
    const occupiedS1 = await ParkingSlotService.updateOccupancy(s1._id, true, society._id);
    assert(occupiedS1.isOccupied === true && occupiedS1.status === "ALLOCATED", "Update physical occupancy");

    // List vehicles
    const vehicles = await VehicleService.listVehicles(society._id);
    assert(vehicles.length === 1, "List vehicles");

    // List slots
    const slots = await ParkingSlotService.listSlots(society._id);
    assert(slots.length === 2, "List parking slots");

    console.log("\n--- ALL END-TO-END TESTS PASSED ---");
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("--- MongoDB Disconnected ---");
  }
};

runTests();
