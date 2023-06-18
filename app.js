import express from "express"
import productR from "./routes/productRoute.js"
import userR from "./routes/userRoute.js"
import orderR from "./routes/orderRoute.js"

import { errorHandler } from "./middleware/error.js";
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json())
app.use(cookieParser())

// Route imports
app.use("/api/v1", productR)
app.use("/api/v1", userR)
app.use("/api/v1", orderR)


app.use(errorHandler)




