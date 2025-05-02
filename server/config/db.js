import mongoose from "mongoose";
import { Url_DB } from "./config.js";

const DB_URI = Url_DB;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Conexión exitosa a Mongo Atlas");
    } catch (err) {
        console.error("Error al conectar a MongoDB:", err.message);
        process.exit(1);
    }
};

export default connectDB;
