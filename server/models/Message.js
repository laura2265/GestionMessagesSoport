import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const MessageSoportScheme =  new mongoose.Schema(
    {
        sender: {
            type: String,
            require: true,
        },
        message: {
            type: String,
            required: true,
        },
        timeStamp: {
            type: Date,
            default: Date.now
        },
        idMessageClient: { type: String },
    }
);

const MessageScheme = new mongoose.Schema(
    {
        contactId: {
            type: String,
            required: true
        },
        usuario:{
            nombre: String,
        },
        messages: [MessageSoportScheme],
        chat: { type: String, required: true },
    },
    { timestamps: true }
);

MessageScheme.plugin(mongoosePaginate)

export default mongoose.model('messanges', MessageScheme);