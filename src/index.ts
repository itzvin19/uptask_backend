import { server } from "./server";
import colors from "colors"
import { generateJWT } from "./utils/jwt";

const port = process.env.PORT || 4000

server.listen(port, () => {
    console.log(colors.cyan.bold(`Conectado al puerto ${port}`))
})