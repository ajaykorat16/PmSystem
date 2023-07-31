const cron = require("node-cron");

const { carryForwardLeaves, createMonthly } = require("../controllers/cron")

//run every year - 1 Jan
cron.schedule("0 0 1 1 *", () => {
    carryForwardLeaves();
});

//run every month
cron.schedule("0 0 1 * *", () => {
    createMonthly();
});