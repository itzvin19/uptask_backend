import { Request, Response } from "express";
import { INote, Note } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
    noteId: Types.ObjectId
}

export class noteController {
    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        const { content } = req.body
        const note = new Note()
        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id)

        await Promise.allSettled([note.save(), req.task.save()])
        res.send("Nota creada correctamente")
    }

    static getNotes = async (req: Request, res: Response) => {
        const notes = await Note.find({ task: req.task.id })
        res.json(notes)
    }

    static deleteNote = async (req: Request<NoteParams>, res: Response) => {

        const note = await Note.findById(req.params.noteId)
        if (!note) {
            res.status(404).send("Note not found")
            return
        }

        if (req.user.id.toString() !== note.createdBy.toString()) {
            res.status(401).send("You can´t delete this note")
            return
        }

        try {
            req.task.notes = req.task.notes.filter(x => {
                console.log(`${x}|| ${note.id}`)
                return x.toString() !== note.id.toString()})
            Promise.allSettled([req.task.save(), note.deleteOne()])
            res.send("Note has been deleted")

        } catch (error) {
            res.status(500).json({ error: error })
        }


    }
}