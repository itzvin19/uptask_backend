import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { IUser, User } from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('Token no válido')
        res.status(401).json({ error: error.message })
        return
    }

    const token = bearer.split(' ')[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_PASS)


        if (typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id).select('_id name email')
            if (user) {
                req.user = user
                next()
            } else {
                res.status(500).json({ error: "Token no válido" })
            }
        }
    } catch (error) {
        res.status(500).json({ error: "Token no válido" })
    }

}

export const onlyManager = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.project.manager.toString() !== req.user.id.toString()) {
            res.status(401).json({ error: "Not Authorized" })
            return
        }
        next()
    } catch (error) {
        res.status(500).send("Something fail")
    }
}