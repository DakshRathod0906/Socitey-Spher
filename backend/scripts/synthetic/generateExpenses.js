import Expense from '../../models/Expense.js';
import config from './config.js';

export async function generateExpenses(randomGen, society, users) {
    const expensesData = [];
    const now = new Date();
    
    if (users.length === 0) return;
    const adminUser = users.find(u => u.role === 'society_admin' || u.role === 'super_admin') || users[0];

    // Let's generate monthly recurring bills since START_DATE
    let currentDate = new Date(config.START_DATE);
    currentDate.setDate(5); // Bills around the 5th of every month
    
    const recurringBase = {
        'MAINTENANCE': 50000, 
        'UTILITIES': 20000, 
        'SALARY': 15000, 
        'SECURITY': 30000
    };

    while (currentDate <= now) {
        // Generate recurring bills for the month
        for (const [category, baseAmount] of Object.entries(recurringBase)) {
            // Amount varies slightly per month, scaled by society expenseBase
            const amount = Math.round(baseAmount * society.profile.characteristics.expenseBase * randomGen.nextInt(95, 105) / 100);
            expensesData.push(new Expense({
                societyId: society.doc._id,
                title: `Monthly ${category} Bill - ${currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}`,
                category: category,
                amount: amount,
                expenseDate: new Date(currentDate.getTime() + randomGen.nextInt(-2, 2) * 86400000), // Randomize day slightly
                vendorName: `Vendor ${category}`,
                status: 'APPROVED',
                recordedBy: adminUser._id
            }));
        }

        // Generate random ad-hoc repairs
        if (randomGen.chance(0.4 * society.profile.characteristics.expenseBase)) {
            const repairAmount = Math.round(10000 * society.profile.characteristics.expenseBase * randomGen.nextInt(50, 200) / 100);
            expensesData.push(new Expense({
                societyId: society.doc._id,
                title: `Ad-hoc Repair Work`,
                category: 'REPAIR',
                amount: repairAmount,
                expenseDate: new Date(currentDate.getTime() + randomGen.nextInt(5, 25) * 86400000),
                vendorName: `Vendor REPAIR`,
                status: 'APPROVED',
                recordedBy: adminUser._id
            }));
        }
        
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    console.log(`  Inserting ${expensesData.length} Expenses...`);
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < expensesData.length; i += CHUNK_SIZE) {
        await Expense.insertMany(expensesData.slice(i, i + CHUNK_SIZE), { validateBeforeSave: false });
    }
}
