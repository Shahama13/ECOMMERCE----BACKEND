import mongoose from "mongoose"

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then((e) => {
        console.log(`Database Connected ${e.connection.host}`)
    })
    
}

export default connectDatabase