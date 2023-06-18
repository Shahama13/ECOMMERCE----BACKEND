import express from "express"
import { deleteUser, forgotPassword, getAllUser, getSingleUser, getUserDetails, logOutUser, loginUser, registerUser, resetPassword, updateUserPassword, updateUserProfile, updateUserRole } from "../controllers/userController.js";
import { isAuthenticatedUser, authorizedRoles } from "../middleware/auth.js";
const router = express.Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser);
router.route("/logout").get(logOutUser);
router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updateUserPassword);
router.route("/me/update").put(isAuthenticatedUser, updateUserProfile);

router.route("/admin/users").get(isAuthenticatedUser, authorizedRoles("admin"), getAllUser)
router.route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizedRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizedRoles("admin"),updateUserRole)
    .delete(isAuthenticatedUser, authorizedRoles("admin"),deleteUser)

router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)

export default router