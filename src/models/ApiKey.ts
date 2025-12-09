import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey extends Document {
    user: mongoose.Types.ObjectId;
    keyHash: string;
    name: string;
    permissions: string[];
    expiresAt: Date;
    revoked: boolean;
}

const ApiKeySchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    keyHash: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    permissions: {
        type: [String],
        default: []
    },
    expiresAt: {
        type: Date,
        required: true
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
