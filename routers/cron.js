const cron = require("node-cron");

const { carryForwardLeaves, createMonthly } = require("../controllers/cron")

//run every year - 1 Jan 00:00
cron.schedule("0 0 1 1 *", () => {
    carryForwardLeaves();
});

//run every month - 00:05
cron.schedule("5 0 1 * *", () => {
    createMonthly();
});