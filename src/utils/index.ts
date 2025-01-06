import bcrypt, { compare } from "bcrypt"

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    return hash
}

export const compareHash=async (inputPassword:string, hash:string)=>{
    const result = await compare(inputPassword,hash)
    return result
}