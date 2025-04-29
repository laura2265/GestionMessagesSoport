import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const MessageSoportScheme =  new mongoose.Schema(
    {
        sender: String,
        message: String,
        timeStamp: {
            type: Date,
            default: Date.now
        },
        idMessageClient: { type: String},
    });

const MessageScheme = new mongoose.Schema(
    {
        contactId: { type: String, required: true },
        usuario:{
            nombre: String,
        },
        conversacion: [MessageSoportScheme],
        chat: { type: String, required: true },
    },
    { timestamps: true }
);

MessageScheme.plugin(mongoosePaginate)

export default mongoose.model('messanges', MessageScheme);