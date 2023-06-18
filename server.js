import { app } from "./app.js";
import { config } from "dotenv"
import connectDatabase from "./config/database.js"


// handling uncaught error/expception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting the server down due to uncaught error/expception`);
    process.exit(1)
})


config({
    path: "./config/config.env"
})

// connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
})



// unhandled promise rejection  -- it is inly unhandled when catch block isnt written 
// on server error just crash it 
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting the server down due to unhndled promise rejection `);


    server.close(() => {
        process.exit(1)
    })
})
