import mongoose from 'mongoose'

export const CATEGORIES = ['electronics', 'keys', 'cards-ids', 'bags', 'clothing', 'other'];

const itemSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        
        type: {
            type: String,
            required: [true, 'type is required'],
            enum: {values: ['lost', 'found'], message: 'type must be "lost" or "found"'},
        },

        title: {
            type: String,
            required: [true, 'title is required'],
            trim: true,
            maxlength: [100, 'title must be at most 100 characters'],
        },

        description: {
            type: String,
            required: false,
            maxlength: [1000, 'description must be at most 1000 characters'],
            default: '', 
        },

        category: {
            type: String,
            required: [true, 'category is required'],
            enum: { values: CATEGORIES, message: `category must be one of: ${CATEGORIES.join(', ')}` },
        },

        location: {
            type: String,
            required: [true, 'location is required'],
            trim: true,
            maxlength: [100, 'location must be at most 100 characters'],
        },
        date: { type: Date, required: [true, 'date is required'] },
        photoUrl: { type: String, trim: true, default: '' },
        status: { type: String, enum: ['open', 'closed'], default: 'open' },
    },
    { timestamps: true }
);

export const Item = mongoose.model('Item', itemSchema);