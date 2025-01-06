import { Request, Response } from "express"
import { User } from "../models/User"
import { Project } from "../models/Project"

export class TeamController {

    static findUserByEmail = async (req: Request, res: Response) => {
        const { email } = req.body
        if (!email) {
            res.status(400).send('Correo inválido')
            return
        }

        const user = await User.findOne({ email }).select('name email id')

        if (!user) {
            res.status(404).send('Correo  no encontrado')
            return
        }

        res.json(user)
    }

    static addToTeamById = async (req: Request, res: Response) => {
        try {
            const { id } = req.body
            const user = await User.findById(id)

            if (req.project.team.some(team => team.toString() === user.id.toString()) || id.toString() === req.project.manager.toString()) {
                res.status(409).send('El usuario ya se encuentra dentro del proyecto')
                return
            }

            if (!user) {
                res.status(404).send('Usuario no encontrado')
                return
            }

            req.project.team.push(id)
            await req.project.save()
            res.send("Usuario añadido correctamente")

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al agregar al usuario al equipo' })
        }
    }

    static deleteUserById = async (req: Request, res: Response) => {
        try {
            const { userId } = req.params
            const user = await User.findById(userId)

            if (!user) {
                res.status(404).send('Usuario no encontrado')
                return
            }

            if (!req.project.team.some(team => team.toString() === user.id.toString())) {
                res.status(409).send('El usuario no se encuentra en el proyecto')
                return
            }

            req.project.team = req.project.team.filter(x => x.toString() !== userId.toString())
            await req.project.save()

            res.send("Usuario eliminado correctamente")


        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al agregar al usuario al equipo' })
        }
    }

    static getProjectTeam = async (req: Request, res: Response) => {

        try {
            const { projectId } = req.params
            const project = await Project.findById(projectId).populate({
                path: 'team',
                select: 'name email id'
            })
            const team = project.team
            res.json(team)


        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al agregar al usuario al equipo' })
        }
    }
}