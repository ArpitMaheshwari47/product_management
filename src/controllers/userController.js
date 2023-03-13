const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { isValid, isValidbody, nameRegex, emailRegex, isValidPassword, objectid, phoneRegex} = require("../validator/validation");

const register = async function (req, res) {
    try {
        let data = req.body
        if (!isValidbody(data)) {
            return res.status(400).send({ status: false, message: "plz enter some keys and values in the data" })
        }
        let { fname, lname, email, phone, password } = data

        //****************************************************NAME VALIDATION*******************************************************************************/

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "plz enter your firstName" })
        }
        if (!nameRegex.test(fname)) {
            return res.status(400).send({ status: false, message: "plz do not use number in naming credential,only alphabets is required in naming credential" })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: "false", message: "plz enter your lastName" })
        }
        if (!nameRegex.test(lname)) {
            return res.status(400).send({ status: false, message: "plz do not use number in naming credential,only alphabets is required in naming credential" })
        }

        //******************************************************EMAIL VALIDATION************************************************************ */        
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "plz enter the emailId" })

        }
        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, message: "enter the valid emailId" })
        }

        let emailCheck = await userModel.findOne({ email: email })
        if (emailCheck) {
            return res.status(400).send({ status: false, message: "emailId is already in use" })

        }

        //***************************************************************************PHONE VALIDATION********************************************************* */

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "plz enter phone number" })
        }

        if (!phoneRegex.test(phone)) {
            return res.status(400).send({ status: false, message: "plz enter valid phoneNumber" })
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "password should be more than 8 characters or less than 15 characters" })
        }
        let phoneCheck = await userModel.findOne({ phone: phone })
        if (phoneCheck) {
            return res.status(400).send({ status: false, message: "phone number is already in use" })
        }
        let createdUser = await userModel.create(data)

        return res.status(201).send({ status: true, message: "User created successsfully", data: createdUser })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const loginUser = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data

        if (!isValidbody(data)) return res.status(400).send({ status: false, message: "email and password cannot be empty" })
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email should be in string format and it cannot be empty" })
        if (!email.match(emailRegex)) return res.status(400).send({ status: false, message: "email is in incorrect format" })
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password should be in string format and it cannot be empty" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password should be 8-15 characters in length." })

        const foundUser = await userModel.findOne({ email: email })
        if (!foundUser) return res.status(401).send({ status: false, message: "invalid credentials" })

        const cmprPassword = await bcrypt.compare(password, foundUser.password)
        if (!foundUser || !cmprPassword) return res.status(401).send({ status: false, message: "invalid credentials" })

        const token = await jwt.sign({ userId: foundUser._id }, "groot", { expiresIn: "7d" })

        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: foundUser._id, token: token } })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const getUser = async function (req, res) {
    try {
        let id = req.params.userId
        if (!id) return res.status(400).send({ status: false, message: "id must be present in params" })
        if (!id.match(objectid)) return res.status(400).send({ status: false, message: "invalid userId" })

        const foundUser = await userModel.findOne({ _id: id })
        if (!foundUser) return res.status(404).send({ status: false, message: "user not found" })

        return res.status(200).send({ status: true, message: "User details", data: foundUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body

        if (!userId) return res.status(400).send({ status: false, message: "Please provide userId" })
        if (!isValid(userId)) return res.status(400).send({ status: false, message: "Incorrect userId" })
        if (!userId.match(objectid)) return res.status(400).send({ status: false, message: "Incorrect userId" })

        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, message: "User not found" })

        if (req.token.userId != userId) return res.status(403).send({ status: false, message: "Not Authorised" })

        if (!isValidbody(data)) return res.status(400).send({ status: false, message: "Please provide data to update" })

        let { fname, lname, email, phone, password} = data
        if (fname) {
            if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname is in incorrect format" })
            if (!fname.match(nameRegex)) return res.status(400).send({ status: false, message: "fname is in incorrect format" })
        }
        if (lname) {
            if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname is in incorrect format" })
            if (!lname.match(nameRegex)) return res.status(400).send({ status: false, message: "lname is in incorrect format" })
        }
        if (email) {
            if (!isValid(email)) return res.status(400).send({ status: false, message: "email is in incorrect format" })
            if (!email.match(emailRegex)) return res.status(400).send({ status: false, message: "email is in incorrect format" })
            let user = await userModel.findOne({ email })
            if (user) return res.status(400).send({ status: false, message: "email already used" })
        }
        if (phone) {
            if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is in incorrect format" })
            if (!phone.match(phoneRegex)) return res.status(400).send({ status: false, message: "phone is in incorrect format" })
            let user = await userModel.findOne({ phone })
            if (user) return res.status(400).send({ status: false, message: "phone already used" })
        }
        if (password) {
            if (!isValid(password)) return res.status(400).send({ status: false, message: "password is in incorrect format" })
            if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "password should be 8-15 characters in length." })
            data.password = await bcrypt.hash(password, 10);
        }
        
        let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, { ...data, ...query }, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { register, loginUser, getUser, updateUser }


