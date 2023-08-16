const Users = require("../models/userModel")
const Leaves = require("../models/leaveModel")
const LeaveManagement = require("../models/leaveManagementModel")

const carryForwardLeaves = async () => {
    try {
        const allUsers = await Users.find({ role: "user" }).select("_id fullName carryForward");
        const currentDate = new Date();
        const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        for (const user of allUsers) {
            const getLeaves = await Leaves.aggregate([
                {
                    $match: {
                        userId: user._id,
                        status: "approved",
                        startDate: {
                            $gte: oneYearAgo
                        }
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        totalLeaves: { $sum: '$totalDays' },
                    },
                },
            ]);

            const previousYearLeaves = await LeaveManagement.aggregate([
                {
                    $match: { user: user._id }
                },
                {
                    $group: {
                        _id: '$user',
                        leave: { $sum: '$leave' },
                    },
                },
            ]);

            for (const lastLeaves of previousYearLeaves) {
                for (const leave of getLeaves) {
                    const finalTotal = (user.carryForward + lastLeaves.leave) - leave.totalLeaves;
                    const carryForwardLeave = finalTotal >= 5 ? 5 : (finalTotal >= 0 ? finalTotal : 0);
                    await Users.findByIdAndUpdate(user._id, { $set: { carryForward: carryForwardLeave, leaveBalance: carryForwardLeave } });
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
        const allUsers = await Users.find({ role: "user" }).select("_id, fullName, carryForward")
        allUsers.map(async (e) => {
            await new LeaveManagement({ user: e._id, monthly: today, leave }).save()
            await Users.findByIdAndUpdate(e._id, { $inc: { leaveBalance: leave } }, { new: true })
        })
    } catch (error) {
        console.log(error);
    }

}
//createMonthly()

module.exports = { carryForwardLeaves, createMonthly }