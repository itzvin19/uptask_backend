import mongoose, { Schema, Document, Types, PopulatedDoc } from "mongoose";
import { IUser } from "./User";
import { INote, Note } from "./Note";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const

export type taskStatusType = typeof taskStatus[keyof typeof taskStatus]

export type TaskType = Document & {
    name: string
    description: string
    project: Types.ObjectId
    status: taskStatusType,
    completedBy: {
        user: Types.ObjectId,
        status: taskStatusType
    }[],
    notes: PopulatedDoc<INote & Document>[]
}

const TaskSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING
            }
        }
    ],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }]
}, { timestamps: true })

TaskSchema.pre('deleteOne', { document: true }, async function () {
    const task = this._id
    if (!task) return
    await Note.deleteMany({ task })
})
export const Task = mongoose.model<TaskType>('Task', TaskSchema)
