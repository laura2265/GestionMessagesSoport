import mongoose from "mongoose";


const DB_URI = 'mongodb://localhost:27017/ControlMessageAndUsers';


const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Conexión exitosa a MongoDB");
    } catch (err) {
        console.error("Error al conectar a MongoDB:", err.message);
        process.exit(1); 
    }
};

export default connectDB;
