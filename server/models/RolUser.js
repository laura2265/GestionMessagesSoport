import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const RolSchema = new  mongoose.Schema({
    typeRol: {type: String, require:true},
    permisos: {type: Array, require: true}
})

RolSchema.plugin(mongoosePaginate)
export default mongoose.model('Rol', RolSchema)