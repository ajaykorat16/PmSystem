const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true,
    },
    users: [
        {
            id: {
                type: mongoose.ObjectId,
                ref: "User",
            }
        }
    ]
}, {
    timestamps: true,
});

const Credential = mongoose.model("Credential", credentialSchema);

module.exports = Credential;
