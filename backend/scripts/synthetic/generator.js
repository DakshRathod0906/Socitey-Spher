import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import config, { DATASET_SCALE } from './config.js';
import RandomGenerator from './random.js';
import { generateSocieties } from './generateSocieties.js';
import { generateTowers } from './generateTowers.js';
import { generateFlats } from './generateFlats.js';
import { generateUsers } from './generateUsers.js';
import { generateVehicles } from './generateVehicles.js';
import { generateComplaints } from './generateComplaints.js';
import { generateVisitors } from './generateVisitors.js';
import { generateExpenses } from './generateExpenses.js';
import { generateNotices } from './generateNotices.js';
import { validateData } from './validator.js';

async function runGenerator() {
    const startTime = process.hrtime.bigint();
    
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        console.log("WARNING: Dropping the database...");
        await mongoose.connection.db.dropDatabase();
        console.log("Database dropped.\n");

        console.log("Pre-hashing default password...");
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash('Password@123', salt);

        const randomGen = new RandomGenerator(config.SEED);

        console.log(`=== PHASE 1: GENERATING SOCIETIES (${config.SOCIETIES}) ===`);
        const societies = await generateSocieties(randomGen);
        console.log(`Created ${societies.length} Societies.\n`);

        for (let i = 0; i < societies.length; i++) {
            const society = societies[i];
            console.log(`\n======================================================`);
            console.log(`GENERATING SOCIETY ${i + 1}/${societies.length}: ${society.doc.name}`);
            console.log(`======================================================`);
            
            console.time(`Society ${i + 1}`);

            // 1. Infrastructure
            const towers = await generateTowers(randomGen, society);
            const flats = await generateFlats(randomGen, society, towers);

            // 2. Demographics
            const users = await generateUsers(randomGen, society, flats, defaultPassword);

            // 3. Operations
            await generateVehicles(randomGen, society, flats);
            await generateComplaints(randomGen, society, flats, users);
            await generateVisitors(randomGen, society, flats, users);
            await generateExpenses(randomGen, society, users);
            await generateNotices(randomGen, society, users);

            console.timeEnd(`Society ${i + 1}`);
            console.log(`Completed Society ${i + 1}\n`);
        }

        console.log("=== PHASE 4: VALIDATION ===");
        await validateData();
        
        const endTime = process.hrtime.bigint();
        const durationSec = Number(endTime - startTime) / 1e9;
        
        const used = process.memoryUsage();
        const peakMemoryMB = Math.round(used.heapUsed / 1024 / 1024);

        console.log("\n======================================================");
        console.log(`Generation Time : ${durationSec.toFixed(2)} sec`);
        console.log(`Peak Memory     : ~${peakMemoryMB} MB`);
        console.log(`Dataset Profile : ${DATASET_SCALE}`);
        console.log(`Seed            : ${config.SEED}`);
        console.log("======================================================\n");

        const summary = {
            scale: DATASET_SCALE,
            seed: config.SEED,
            societies: config.SOCIETIES,
            users: config.SCALE.users,
            visitors: config.SCALE.visitors,
            complaints: config.SCALE.complaints,
            expenses: config.SCALE.expenses,
            generatedAt: new Date().toISOString(),
            generationTimeSeconds: durationSec,
            peakMemoryMB: peakMemoryMB
        };

        const summaryPath = path.join(__dirname, 'dataset_summary.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
        console.log(`Wrote summary report to ${summaryPath}`);

        console.log("\nSynthetic data generation completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Generator failed:", error);
        process.exit(1);
    }
}

runGenerator();
