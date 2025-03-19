import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const MessageScheme = new mongoose.Schema(
    {
        contactId: { type: String, required: true },
        message: { type: [String], required: true },
        sender: { type: String, required: true },
        chat: { type: String, required: true },
        idMessageClient: { type: String},
    },
    { timestamps: true }
);

MessageScheme.plugin(mongoosePaginate)

export default mongoose.model('messanges', MessageScheme);