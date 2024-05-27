const { USERS, LEAVEMANAGEMENTS, LEAVES } = require("../constants/tables");
const { knex } = require('../database/db');

const carryForwardLeaves = async () => {
    try {
        const allUsers = await knex.select('u.id', 'u.fullName', 'u.carryForward', 'u.leaveBalance').from(`${USERS} as u`).where('role', 'user')
        const currentDate = new Date();
        const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

        for(const user of allUsers) {
            const getLeaves = await knex(`${LEAVES} as l`)
                .select('l.userId', knex.raw('SUM(l.totalDays) as totalLeaves'))
                .where('l.userId', user.id)
                .andWhere('l.status', 'approved')
                .andWhere('l.leaveType', 'paid')
                .andWhere('l.startDate', '>=', oneYearAgo)
                .groupBy('l.userId');
            
            const previousYearLeaves = await knex(`${LEAVEMANAGEMENTS} as lm`)
                .select('lm.user', knex.raw('SUM(lm.leave) as totalLeave'))
                .where('lm.user', user.id)
                .andWhere('lm.monthly', '>=', oneYearAgo)
                .groupBy('lm.user');

            for (const lastLeaves of previousYearLeaves) {
                for (const leave of getLeaves) {
                    const finalTotal = (parseFloat(user.carryForward) + parseFloat(lastLeaves.totalLeave)) - parseFloat(leave.totalLeaves);
                    const carryForwardLeave = finalTotal >= 5 ? 5 : (finalTotal >= 0 ? finalTotal : 0);
                    await knex(USERS).where('id', user.id).update({ 
                        carryForward: carryForwardLeave, 
                        leaveBalance: carryForwardLeave,
                        updatedAt: new Date()
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}
// carryForwardLeaves()

const createMonthly = async () => {
    try {
        let today = new Date();
        let leave = 1.5

        const allUsers = await knex(USERS).where('role', 'user');

        allUsers.map(async (e) => {
            await knex(LEAVEMANAGEMENTS).insert({ user: e.id, monthly: today, leave });
            
            await knex(USERS).where('id', e.id).increment('leaveBalance', leave).update({ updatedAt: new Date() });
        })
    } catch (error) {
        console.log(error);
    }
}
// createMonthly()

module.exports = { carryForwardLeaves, createMonthly }