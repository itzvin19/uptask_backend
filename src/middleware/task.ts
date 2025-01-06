import { Request, Response, NextFunction } from "express"
import { Task, TaskType } from "../models/Task"

declare global {
    namespace Express {
        interface Request {
            task: TaskType
        }
    }
}

export const validateTaskExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if (!task) {
            res.status(404).send("The task doesn´t exits")
            return
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).send("Something fail")
    }
}

export const verifyTaskBelongsProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.task.project.toString() !== req.project.id.toString()) {
            res.status(401).send("Not Authorized")
            return
        }
        next()
    } catch (error) {
        res.status(500).send("Something fail")
    }
}