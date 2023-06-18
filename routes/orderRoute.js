import express from "express"
import { isAuthenticatedUser, authorizedRoles } from "../middleware/auth.js";
import { deleteOrder, getAllOrders, getSingleOrderDetails, myOrders, newOrder, updateOrder } from "../controllers/orderController.js";

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder)

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrderDetails)

router.route("/orders/me").get(isAuthenticatedUser, myOrders)

router.route("/admin/orders").get(isAuthenticatedUser, authorizedRoles("admin"), getAllOrders)

router.route("/admin/order/:id").put(isAuthenticatedUser, authorizedRoles("admin"), updateOrder)
    .delete(isAuthenticatedUser, authorizedRoles("admin"), deleteOrder)

export default router