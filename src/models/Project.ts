import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import { Task, TaskType } from "./Task";
import { IUser } from "./User";
import { Note } from "./Note";



export type ProjectType = Document & {
    projectName: string,
    clientName: string,
    description: string,
    tasks: PopulatedDoc<TaskType & Document>[],
    manager: PopulatedDoc<IUser & Document>,
    team: PopulatedDoc<IUser & Document>[]

}

const ProjectSchema = new Schema({
    projectName: {
        type: String,
        trim: true,
        required: true
    },
    clientName: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    tasks: [{
        type: Types.ObjectId,
        ref: 'Task'
    }],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [{
        type: Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true })

ProjectSchema.pre('deleteOne', { document: true, query: false }, async function () {
    const project = this._id
    if (!project) return
    const tasks = await Task.find({ project })
    for (const task of tasks) {
        await Note.deleteMany({ task: task.id })
    }
    await Task.deleteMany({ project })
})
export const Project = mongoose.model<ProjectType>('Project', ProjectSchema)
