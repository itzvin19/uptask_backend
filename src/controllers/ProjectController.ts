import { Request, Response } from "express"
import { Project } from "../models/Project"
import { compareHash } from "../utils"
import { User } from "../models/User"

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        try {
            const project = new Project(req.body)

            project.manager = req.user.id

            await project.save()
            res.send("Proyecto creado correctamente")

        } catch (error) {
            console.log(error)
        }

    }

    static getAllProjects = async (req: Request, res: Response) => {
        try {

            const projects = await Project.find({
                $or: [
                    { manager: { $in: req.user.id } },
                    { team: { $in: req.user.id } }
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error)
        }

    }

    static findProjectById = async (req: Request, res: Response) => {
        try {
            if (req.project.manager.toString() !== req.user.id.toString() && !req.project.team.includes(req.user.id)) {
                res.status(401).json({ error: 'Acción no válida' })
                return
            }
            res.json(req.project)
        } catch (error) {
            console.log(error)
        }

    }

    static updateProject = async (req: Request, res: Response) => {
        try {
            await req.project.save()
            res.send("Proyecto Actualizado")
        } catch (error) {
            console.log(error)
        }

    }

    static deleteProject = async (req: Request, res: Response) => {
        try {
            const { password } = req.body
            const user = await User.findById(req.user.id)

            const isValidPassword = await compareHash(password, user.password)

            if (!isValidPassword) {
                res.status(401).send("Contraseña incorrecta")
                return
            }
            await req.project.deleteOne()
            res.send("Proyecto Eliminado")
        } catch (error) {
            console.log(error)
        }

    }

}