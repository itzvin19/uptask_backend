import { Request, Response, NextFunction } from "express"
import { Project, ProjectType } from "../models/Project"

declare global {
    namespace Express {
        interface Request {
            project: ProjectType
        }
    }
}

export const validateProjectExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { projectId } = req.params
        const project = await Project.findById(projectId).populate('tasks')
        if (!project) {
            res.status(404).send("The project doesn´t exits")
            return
        }
        req.project = project
        next()
    } catch (error) {
        res.status(500).send("Something fail")
    }

}