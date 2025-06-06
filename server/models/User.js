import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const UserScheme = new mongoose.Schema({
    tipoDocument: {type: String},
    numberDocument: { type: String, unique: true },
    name: {type: String},
    lasName: {type: String, required: true},
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    rol:{ type: Number, require: true },
    telefono: String,
    direccion: String,
    estado: String,
    cargo: String,
    area: String,
}, {timestamps: true});


UserScheme.plugin(mongoosePaginate)

export default mongoose.model("users", UserScheme); 
