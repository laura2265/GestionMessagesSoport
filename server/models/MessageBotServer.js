import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const MessageServerSchema = new mongoose.Schema({
  de: String,
  mensaje: String,
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const ConversacionSchema = new mongoose.Schema({
  id: String,
  usuario: {
    nombre: String,
    email: String,
    navegador: String,
    ip: String,
  },
  fechaInicio: {
    type: Date,
    default: Date.now,
  },
  fechaUltimoMensaje: {
    type: Date,
    default: Date.now,
  },
  estadoActual: String,
  conversacion: [MessageServerSchema],
  finalizacion: Boolean,
});

ConversacionSchema.plugin(mongoosePaginate);

// Cambiamos el nombre del modelo para que sea más claro
export default mongoose.model("Conversacion", ConversacionSchema);
