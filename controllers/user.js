const Users = require("../models/userModel")
const { validationResult } = require('express-validator');
const fs = require("fs")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10

const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword
    } catch (error) {
        console.log(error)
    }
}

const comparePassword = async (password, hashPassword) => {
    try {
        return bcrypt.compare(password, hashPassword)
    } catch (error) {
        console.log(error)
    }
}


const createUser = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining } = req.body

        const existingUser = await Users.findOne({ email })

        if (existingUser) {
            return res.status(200).json({
                error: true,
                message: "User already register with this email"
            })
        }
        const hashedPassword = await hashPassword(password)

        const newUser = await new Users({ firstname, lastname, email, password: hashedPassword, phone, address, dateOfBirth, department, dateOfJoining }).save()

        return res.status(201).json({
            error: false,
            message: "User Register successfully !!",
            user: newUser
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
}

const loginUser = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ email })
        if (!user) {
            return res.status(400).json({
                error: true,
                message: "Invalid Email, Please Sigup first."
            })
        }

        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            })
        }

        const token = await jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: '5 days' });

        return res.status(200).send({
            error: false,
            message: "User login successfully!!",
            user,
            token
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
}

const updateUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining } = req.fields
        const { photo } = req.files;
        const { id } = req.params

        let user;

        if (id) {
            user = await Users.findById(id)
        } else {
            user = await Users.findById(req.user._id)
        }

        if (password && password.length < 6) {
            return res.send({ message: "Password is required and atleast 6 character" })
        }

        const hashedPassword = password ? await hashPassword(password) : undefined

        const updateUser = await Users.findByIdAndUpdate(user._id, {
            ...req.fields,
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            email: email || user.email,
            phone: phone || user.phone,
            address: address || user.address,
            password: hashedPassword || user.passwordlastname,
            dateOfBirth: dateOfBirth || user.dateOfBirth,
            department: department || user.department,
            dateOfJoining: dateOfJoining || user.dateOfJoining
        }, { new: true })

        if (photo) {
            updateUser.photo.data = fs.readFileSync(photo.path);
            updateUser.photo.contentType = photo.type;
        }

        return res.status(201).send({
            error: false,
            message: "Profile Updated Successfully !!",
            updateUser
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
}

const deleteUserProfile = async (req, res) => {
    try {
        const { id } = req.params
        const user = await Users.findOne({ _id: id })
        if (!user) {
            return res.status(400).json({
                error: true,
                message: "Invalid User"
            })
        }

        await Users.findByIdAndDelete({ _id: id })

        return res.status(200).send({
            error: false,
            message: "Profile Delete Successfully !!",
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
}

const getAllUser = async (req, res)=>{
    try {
        const getAllUsers = await Users.find()
        return res.status(200).json({
            error: false,
            message: "All users get successfully!!",
            getAllUsers
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
}



module.exports = { createUser, loginUser, updateUser, deleteUserProfile, getAllUser }