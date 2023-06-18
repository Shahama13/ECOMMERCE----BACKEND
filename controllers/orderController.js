import { Order } from "../models/orderModel.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Product } from "../models/productModel.js";

// CREATE NEW ORDER
export const newOrder = catchAsyncError(async (req, res, next) => {

    const { shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    });
    res.status(200).json({
        success: true,
        order
    })

})

// GET SINGLE ORDER DETAILS 
export const getSingleOrderDetails = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    // .populate("user","name email")

    if (!order) return next(new Error("Order not found with this id"))

    res.status(200).json({
        success: true,
        order
    })
})


// GET LOGGED IN USER ORDERS DETAILS 
export const myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })

    res.status(200).json({
        success: true,
        orders
    })
})

// GET ALL ORDERS ___ ADMIN
export const getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find()


    let totalAmount = 0

    await orders.forEach(order => {
        totalAmount += order.totalPrice
        console.log(totalAmount)
    })
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

// update oRDER STATUS ___ ADMIN
export const updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new Error("Order not found with this id"))

    if (order.orderStatus === "Delivered") return next(new Error("You have already delivered this product"))

    order.orderItems.forEach(async (order) => {
        await updateStock(order.product, order.quantity)
    })

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now()
    }

    await order.save({ validateBeforeSave: false })
    res.status(200).json({
        success: true,
    })
})


async function updateStock(id, quantity) {
    const product = await Product.findById(id)

    product.Stock = product.Stock - quantity

    await product.save({ validateBeforeSave: false })
}

// DELETE ORDER ___ ADMIN
export const deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new Error("Order not found with this id"))

    await order.deleteOne()

    res.status(200).json({
        success: true,
    })
})