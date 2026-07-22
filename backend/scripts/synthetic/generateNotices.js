import Notice from '../../models/Notice.js';
import config from './config.js';

export async function generateNotices(randomGen, society, users) {
    const noticesData = [];
    const now = new Date();
    if (users.length === 0) return;
    const adminUser = users.find(u => u.role === 'society_admin' || u.role === 'super_admin') || users[0];

    let currentDate = new Date(config.START_DATE);
    currentDate.setDate(1); 

    while (currentDate <= now) {
        // Monthly general notice
        noticesData.push(new Notice({
            societyId: society.doc._id,
            title: `Monthly Update - ${currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}`,
            content: `Please find the updates and maintenance schedule for this month.`,
            isImportant: false,
            createdBy: adminUser._id,
            createdAt: new Date(currentDate.getTime()),
            updatedAt: new Date(currentDate.getTime())
        }));

        const month = currentDate.getMonth();

        // Festival announcements (October - November)
        if (month === 9 || month === 10) {
            noticesData.push(new Notice({
                societyId: society.doc._id,
                title: `Festival Celebrations!`,
                content: `Join us for the upcoming festival celebrations in the clubhouse!`,
                isImportant: true,
                createdBy: adminUser._id,
                createdAt: new Date(currentDate.getTime() + 5 * 86400000), // ~5th of the month
                updatedAt: new Date(currentDate.getTime() + 5 * 86400000)
            }));
        }

        // Random Emergency Notice (10% chance per month)
        if (randomGen.chance(0.1)) {
            noticesData.push(new Notice({
                societyId: society.doc._id,
                title: `URGENT: Water Supply Disruption`,
                content: `Water supply will be disrupted for 2 hours today due to emergency repairs.`,
                isImportant: true,
                createdBy: adminUser._id,
                createdAt: new Date(currentDate.getTime() + randomGen.nextInt(1, 28) * 86400000),
                updatedAt: new Date(currentDate.getTime() + randomGen.nextInt(1, 28) * 86400000)
            }));
        }

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    console.log(`  Inserting ${noticesData.length} Notices...`);
    const CHUNK_SIZE = 5000;
    for (let i = 0; i < noticesData.length; i += CHUNK_SIZE) {
        await Notice.insertMany(noticesData.slice(i, i + CHUNK_SIZE), { validateBeforeSave: false });
    }
}
