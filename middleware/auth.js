import { User } from "../models/userModel.js";
import { catchAsyncError } from "./catchAsyncError.js";
import jwt from "jsonwebtoken"

export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) return next(new Error("Please Login to Access "));

    const decodedData = await jwt.verify(token, process.env.JWT_SECRET)
  
    req.user = await User.findById(decodedData.id)

    next();
})

export const authorizedRoles = (...roles) => {
    return (req, res, next) => {

    
        if (!roles.includes(req.user.role)) {
            return next(new Error(`Role: ${req.user.role} is not allowed to access this read Source`))
        }
        next();

    }
}

