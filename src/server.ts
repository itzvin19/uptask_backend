import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./config/db";
import { projectRouter } from "./routes/projectRoutes";
import { corsOptions } from "./config/cors";
import morgan from "morgan";
import { authRouter } from "./routes/authRoutes";

dotenv.config()

connectDB()

export const server = express()

server.use(cors(corsOptions))
server.use(morgan('dev'))
server.use(express.json())

server.use('/api/projects', projectRouter)
server.use('/api/auth', authRouter)