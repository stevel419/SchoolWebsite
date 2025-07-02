const { Attendance } = require('../schemas');


async function yourMidnightTask() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Midnight today

  const result = await Attendance.updateMany(
    { finalized: true, date: { $lt: today } },
    { $set: { finalized: false } }
  );

  console.log(`[CRON] Reset ${result.modifiedCount} attendance records.`);
}

module.exports = yourMidnightTask;
