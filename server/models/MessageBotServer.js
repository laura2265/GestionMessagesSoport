import { timeStamp } from "console";
import mongoose, { mongo } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';
import { type } from "os";

const MessageServerScheme = new mongoose.Schema({
    de: String,
    mensaje: String,
    timeStamp:{
        type: Date, 
        default: Date.now
    }
})

const conversacionScheme = new mongoose.Schema({
    id: String,
    usuario:{
        nombre: String,
        email: String,
        navegador: String,
        ip: String
    },
    fechaInicio:{
        type: Date, 
        default: Date.now
    },
    fechaUltimoMensaje:{
        type: Date, 
        default: Date.now
    },
    estadoActual: String,
    conversacion: [MessageServerScheme],
    finalizacion: Boolean
})

conversacionScheme.plugin(mongoosePaginate);

export default mongoose.model('chatbot-server', conversacionScheme)


