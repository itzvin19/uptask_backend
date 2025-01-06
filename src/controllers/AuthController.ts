import { Request, Response } from "express"
import { User } from "../models/User"
import { compareHash, hashPassword } from "../utils"
import { Token } from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"


export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {

            const { password, email } = req.body
            const user = new User(req.body)
            const token = new Token()
            token.user = user.id
            token.token = generateToken()

            const userExists = await User.findOne({ email })

            if (userExists) {
                const error = new Error('Ya existe un correo registrado')
                res.status(409).json({ error: error.message })
                return
            }

            AuthEmail.sendConfirmationEmail({
                email: user.email,
                token: token.token,
                name: user.name
            })

            user.password = await hashPassword(password)

            Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta Creada, revisa tu correo para confirmarla')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al crear la cuenta' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {

            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(401).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send("Cuenta confirmada correctamente")


        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al confirmar la cuenta' })
        }
    }

    static Login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const userExists = await User.findOne({ email })

            if (!userExists) {
                const error = new Error('Email o contraseña incorrectos')
                res.status(400).json({ error: error.message })
                return
            }

            if (!userExists.confirmed) {
                const error = new Error('Debe confirmar su cuenta. Se ha enviado un correo con la confirmación')
                res.status(400).json({ error: error.message })

                const token = new Token()
                token.token = generateToken()
                token.user = userExists.id
                AuthEmail.sendConfirmationEmail({ email: userExists.email, name: userExists.name, token: token.token })
                await token.save()
                return
            }

            const result = await compareHash(password, userExists.password)


            if (!result) {
                const error = new Error('Email o contraseña incorrectos')
                res.status(400).json({ error: error.message })
                return
            }
            const jwt = generateJWT({ id: userExists.id })

            res.send(jwt)


        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }


    static requestNewCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('Correo no registrado')
                res.status(409).json({ error: error.message })
                return
            }

            if (user.confirmed) {
                const error = new Error('La cuenta ya se encuentra confirmada')
                res.status(409).json({ error: error.message })
                return
            }

            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            AuthEmail.sendConfirmationEmail({
                email: user.email,
                token: token.token,
                name: user.name
            })

            await token.save()

            res.send('Se ha enviado un correo con un código de confirmación')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                const error = new Error('Correo no registrado')
                res.status(409).json({ error: error.message })
                return
            }

            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            AuthEmail.sendResetPasswordEmail({
                email: user.email,
                token: token.token,
                name: user.name
            })

            await token.save()

            res.send('Se ha enviado un correo con las instrucciones')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {

            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(401).json({ error: error.message })
                return
            }

            res.send("Token válido, rellene el formulario para reestablecer su contraseña")


        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al confirmar la cuenta' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {

            const { password } = req.body
            const { token } = req.params

            const tokenExists = await Token.findOne({ token })

            if (!tokenExists) {
                const error = new Error('Token no válido')
                res.status(401).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExists.user)
            if (!user) {
                const error = new Error('Usuario no válido')
                res.status(401).json({ error: error.message })
                return
            }

            user.password = await hashPassword(password)

            Promise.allSettled([tokenExists.deleteOne(), user.save()])



            res.send("Token válido, rellene el formulario para reestablecer su contraseña")


        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al confirmar la cuenta' })
        }
    }

    static user = async (req: Request, res: Response) => {
        const user = req.user
        res.json(user)
        return
    }

    static updateUser = async (req: Request, res: Response) => {

        const { email, name } = req.body
        const userExist = await User.findOne({ email })

        if (userExist && req.user.id.toString() !== userExist.id.toString()) {
            res.status(409).json({error:"Correo ya registrado"})
        }

        req.user.email = email
        req.user.name = name

        try {
            await req.user.save()
            res.send("Usuario actualizado correctamente")
        } catch (error) {
            res.status(500).send("Hubo un error")
        }

    }

    static ChangeUserPassword = async (req: Request, res: Response) => {

        const { password, current_password } = req.body
        const user = await User.findById(req.user._id)

        console.log(current_password)

        const passwordIsValid = await compareHash(current_password, user.password)

        if (!passwordIsValid) {
            res.status(409).json({error:"El password actual no es correcto"})
            return
        }
        try {
            const newHash = await hashPassword(password)
            user.password = newHash

            await user.save()
            res.send("Contraseña cambiada correctamente")
        } catch (error) {
            res.status(500).send("Hubo un error")
        }
    }

}