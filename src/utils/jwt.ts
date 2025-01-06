import jwt from "jsonwebtoken"


export type LoginJWT = {
    id: string
}
export const generateJWT = ({ id }: LoginJWT) => {

    const token = jwt.sign({ id }, process.env.JWT_SECRET_PASS, {
        expiresIn: '180d'
    })

    return token
}