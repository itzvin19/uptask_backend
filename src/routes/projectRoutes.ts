import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validator";
import { validateProjectExists } from "../middleware/project";
import { TaskController } from "../controllers/TaskController";
import { validateTaskExists, verifyTaskBelongsProject } from "../middleware/task";
import { authenticate, onlyManager } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { noteController } from "../controllers/NoteController";



export const projectRouter = Router()

projectRouter.use(authenticate)

projectRouter.post('/',
    body('projectName').notEmpty().withMessage("El Nombre del Proyecto es obligatorio"),
    body('clientName').notEmpty().withMessage("El Nombre del Cliente es obligatorio"),
    body('description').notEmpty().withMessage("La descripción del Proyecto es obligatoria"),
    handleInputErrors,
    ProjectController.createProject)

projectRouter.get('/', ProjectController.getAllProjects)

projectRouter.param('projectId', validateProjectExists)

projectRouter.get('/:projectId',
    param('projectId').isMongoId().withMessage("ID no Válido"),
    handleInputErrors,
    ProjectController.findProjectById)

projectRouter.put('/:projectId',
    param('projectId').isMongoId().withMessage("ID no Válido"),
    body('projectName').notEmpty().withMessage("El Nombre del Proyecto es obligatorio"),
    body('clientName').notEmpty().withMessage("El Nombre del Cliente es obligatorio"),
    body('description').notEmpty().withMessage("La descripción del Proyecto es obligatoria"),
    handleInputErrors,
    onlyManager,
    ProjectController.updateProject)

projectRouter.post('/:projectId/delete',
    body('password').notEmpty().withMessage('Debe ingresar un password'),
    param('projectId').isMongoId().withMessage("ID no Válido"),
    handleInputErrors,
    ProjectController.deleteProject)


/** Task Router **/


projectRouter.param('taskId', validateTaskExists)
projectRouter.param('taskId', verifyTaskBelongsProject)

projectRouter.post('/:projectId/tasks',
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    body('name').notEmpty().withMessage("El Nombre de la Tarea es obligatorio"),
    body('description').notEmpty().withMessage("La descripción de la tarea es obligatoria"),
    handleInputErrors,
    TaskController.createTask
)

projectRouter.get('/:projectId/tasks',
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    handleInputErrors,
    TaskController.getAllTasks
)

projectRouter.get('/:projectId/tasks/:taskId',
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    param("taskId").isMongoId().withMessage("El Id es inválido"),
    handleInputErrors,
    TaskController.getTaskById
)

projectRouter.put('/:projectId/tasks/:taskId',
    onlyManager,
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    param("taskId").isMongoId().withMessage("El Id es inválido"),
    body('name').notEmpty().withMessage('El nombre de la tarea es obligatoria'),
    body('description').notEmpty().withMessage("La descripción de la tarea es obligatoria"),
    handleInputErrors,
    TaskController.updateTask
)

projectRouter.delete('/:projectId/tasks/:taskId',
    onlyManager,
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    param("taskId").isMongoId().withMessage("El Id es inválido"),
    handleInputErrors,
    TaskController.deleteTask
)

projectRouter.post('/:projectId/tasks/:taskId/status',
    onlyManager,
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    param("taskId").isMongoId().withMessage("El Id es inválido"),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)
/** Notas */

projectRouter.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    noteController.createNote
)

projectRouter.get('/:projectId/tasks/:taskId/notes',
    handleInputErrors,
    noteController.getNotes
)

projectRouter.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Note ID no válido'),
    handleInputErrors,
    noteController.deleteNote
)

/** Team */

projectRouter.post('/:projectId/team/find',
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    body('email').toLowerCase().isEmail().withMessage('email no válido'),
    handleInputErrors,
    TeamController.findUserByEmail
)
projectRouter.post('/:projectId/team',
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    body('id').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TeamController.addToTeamById
)

projectRouter.delete('/:projectId/team/:userId',
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    param('userId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TeamController.deleteUserById
)

projectRouter.get('/:projectId/team',
    param("projectId").isMongoId().withMessage("El Id es inválido"),
    handleInputErrors,
    TeamController.getProjectTeam
)

