const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
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
