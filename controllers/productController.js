import { Product } from "../models/productModel.js"
import { catchAsyncError } from "../middleware/catchAsyncError.js"
import Apifeatures from "../utils/apiFeatures.js"

// Create a Product -- ADMIN
export const createProduct = catchAsyncError(async (req, res, next) => {

    req.body.user = req.user.id
    const product = await Product.create(req.body)
    res.status(200).json({
        successs: true,
        product
    })
})

// GET ALL PRODUCTS

export const getAllProducts = catchAsyncError(async (req, res, next) => {

    const resultPerPage = 5;
    const productCount = await Product.countDocuments()

    const apiFeature = new Apifeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const products = await apiFeature.query

    res.status(200).json({
        successs: true,
        products,
        productCount
    })
})

// Get single product details
export const getProductDetails = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new Error("Product Not Found"))

    res.status(200).json({
        success: true,
        product
    })

})


// Update a Product -- ADMIN

export const updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id)

    if (!product) return next(new Error("Product Not Found"))

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    }
    )

    res.status(200).json({
        successs: true,
        product
    })
})


// DELETE PRODUCT __ADMIN

export const deleteProduct = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) return next(new Error("Product Not Found"))

    await product.deleteOne(),

        res.status(200).json({
            success: true,
            message: "Product Deleted successfully"
        })

})


// CREATE NEW REVIEWS OR UPDATE IT

export const createProductReview = catchAsyncError(async (req, res, next) => {

    const { rating, comment, productId } = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }


    const product = await Product.findById(productId);


    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString())

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev => rev.user.toString() === req.user._id.toString()) {

                rev.rating = rating,
                    rev.comment = comment
            }
        })
    }
    else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;

    product.reviews.forEach(rev => {
        avg += rev.rating
    })
    product.ratings = avg / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true
    })
})






// GET ALL REVIEWS of A PRODUCT
export const getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) return next(new Error("Product not found"))

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})

// Delete Review 
export const deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    console.log(product.reviews)
    if (!product) return next(new Error("Product not found"))

    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString())

    if (reviews.length === 0) {
        const ratings=0
        const numOfReviews=0
        await Product.findByIdAndUpdate(req.query.productId,{ratings, numOfReviews,reviews})
        res.status(200).json({
            success: true
        })
    }
    else {
        let avg = 0;

        reviews.forEach((rev) => {
            avg += rev.rating;
            console.log(avg)
        })

        const ratings = avg / reviews.length;
        
        const numOfReviews = reviews.length;
       
         await Product.findByIdAndUpdate(
            req.query.productId,
            { reviews, ratings, numOfReviews }, {
            new: true, runValidators: true,
            useFindAndModify: false
        })
       
        res.status(200).json({
            success: true
        })
    }
})