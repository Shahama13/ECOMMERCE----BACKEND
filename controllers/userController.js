import { catchAsyncError } from "../middleware/catchAsyncError.js"
import { User } from "../models/userModel.js"
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"


export const registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "this is a sample id",
            url: "profilepicUrl"
        }
    });

    sendToken(user, 201, res);
})

export const loginUser = catchAsyncError(async (req, res, next) => {


    const { email, password } = req.body

    // checking if user has given password and email both
    if (!email || !password) {
        return next(new Error("Please enter email and password"))
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) return next(new Error("Invalid email or password "))

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) return next(new Error("Invalid email or password "))

    sendToken(user, 200, res);


})


export const logOutUser = catchAsyncError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        //for our backend will be at different website and frontend at different website
        secure: process.env.NODE_ENV === "Development" ? false : true
        //if sameSite is set to none  then in that case secure should be set to true otherwise cookies will be blocked
    })

    res.status(200).json({
        success: true,
        message: "Logged out"
    })
})

// GET USER DETAILS

export const getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

// Forgot password

export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) return next(new Error("user not found"))

    // Get rest password token 
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const restPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `your password reset token is: \n\n ${restPasswordUrl}\n\n if you have not requested this email then ignore it`

    try {

        await sendEmail({
            email: user.email,
            subject: "Ecommerce password recovery",
            message,
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })


    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })

        return next(new Error(error.message))
    }

})


// RESET PASSWORD AFTER EMAIL
export const resetPassword = catchAsyncError(async (req, res, next) => {

    // creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex")


    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })
    if (!user) return next(new Error("Reset passord token is ivaliud or has been expired"))

    if (req.body.password !== req.body.confirmPassword)
        return next(new Error("password doesn't match"))


    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;


    await user.save()
    sendToken(user, 201, res);
})


// UPDATE USER PASSWORD
export const updateUserPassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) return next(new Error("Incorrect old password"))

    if (req.body.newPassword !== req.body.confirmPassword) return next(new Error("password doesnt match"))

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)

})


// UPDATE USER PROFILE
export const updateUserProfile = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    // CLOUDINARY FOR LATER

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndmodify: false,
    })
    res.status(200).json({
        success: true
    })

})

// GET NUMBER OF USERS FOR ADMIN TO SEE

export const getAllUser = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        users
    })
})


// GET USER DETAILS FOR ADMIN TO SEE

export const getSingleUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new Error(`user does not exist with Id ${req.params.id}`))

    res.status(200).json({
        success: true,
        user
    })
})


// MODIFY USER ROLE ADMIN
export const updateUserRole = catchAsyncError(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndmodify: false,
    })
    res.status(200).json({
        success: true
    })

})


//DELETE USER ROLE ADMIN
export const deleteUser = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.params.id)

  if(!user) return next(new Error(`User does not exist with id: ${req.params.id}`))

  await user.deleteOne()

    res.status(200).json({
        success: true,
        message:"user deleted successfully"
    })

})