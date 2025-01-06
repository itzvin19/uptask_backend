import { Request, Response } from "express"
import { Task } from "../models/Task"

export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        try {
            const project = req.project
            const task = new Task(req.body)
            task.project = project.id
            project.tasks.push(task.id)
            await Promise.allSettled([task.save(), project.save()])
            res.send("Tarea creada correctamente")

        } catch (error) {
            res.status(500).send("Ocurrió un error")
        }
    }

    static getAllTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project');
            res.json({ tasks })

        } catch (error) {
            res.status(500).send("Ocurrió un error")
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id).populate({ path: 'completedBy.user', select: 'name email id' })
                .populate({ path: 'notes', populate: { path: 'createdBy', select: 'name email id' } })
            res.json(task)
        } catch (error) {
            res.status(500).send("Ocurrió un error")
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {

            const task = await Task.findByIdAndUpdate(req.task.id, req.body)
            await task.save()
            res.send('Tarea Actualizada')

        } catch (error) {
            res.status(500).send('Ocurrió un error')
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter(x => x.toString() !== req.task.id)

            await Promise.allSettled([req.task.deleteOne(), req.project.save()])
            res.send('Tarea Eliminada correctamente')

        } catch (error) {
            res.status(500).json({error:"Ocurrió un problema"})
        }
    }

    static updateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status

            const data = { user: req.user.id, status }
            req.task.completedBy.push(data)
            await req.task.save()
            res.send('Tarea actualizada')

        } catch (error) {
            res.status(500).send("Ocurrió un problema")
        }
    }
}