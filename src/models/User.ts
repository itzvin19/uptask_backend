import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string,
    password: string,
    name: string,
    confirmed: boolean
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        required: true,
        type: String
    },
    name: {
        required: true,
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

export const User = mongoose.model<IUser>('User', userSchema)