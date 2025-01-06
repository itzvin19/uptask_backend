import mongoose from "mongoose";
import colors from "colors"
import { exit } from "node:process"

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL)
        console.log(colors.magenta.bold("Conexión exitosa a la BD"))
    } catch (error) {
        console.log(colors.red.bold("Error en la conexión con MongoDB"))
        exit(1)
    }
}