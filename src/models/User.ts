import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    email: string;
    name: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
