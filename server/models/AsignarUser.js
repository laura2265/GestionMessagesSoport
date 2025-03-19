import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const AsignarUser = new mongoose.Schema({
    nombreEmple: {
        type: String,
        require: true
    },
    idEmple:{
        type: String,
        require: true
    },
    nombreClient: {
        type: String,
        require: true
    },
    cahtId: {
        type: String,
        require: true
    },
    chatName:{
        type: String,
        require: true
    },
    categoriaTicket: {
        type: String,
        require: true
    },
    Descripcion: {
        type: [String],
        require: true
    }
},{timestamps: true})

AsignarUser.plugin(mongoosePaginate)
export default mongoose.model('asignar-user', AsignarUser)