import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validator";
import { authenticate } from "../middleware/auth";

export const authRouter = Router()

authRouter.post('/create-account',
    body('name').notEmpty().withMessage('El nombre no puede ir vacío'),
    body('password').isLength({ min: 8 }).withMessage('El password es muy corto, mínimo 8 caractéres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.createAccount
)

authRouter.post('/confirm-account',
    body('token').notEmpty().withMessage('Token inválido'),
    handleInputErrors,
    AuthController.confirmAccount
)

authRouter.post('/login',
    body('email').isEmail().withMessage('Email no válido'),
    body('password').notEmpty().withMessage('Debe de ingresar un password'),
    handleInputErrors,
    AuthController.Login
)

authRouter.post('/request-code',
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.requestNewCode
)

authRouter.post('/forgot-password',
    body('email').isEmail().withMessage('Email no válido'),
    handleInputErrors,
    AuthController.forgotPassword
)

authRouter.post('/validate-token',
    body('token').notEmpty().withMessage('Token inválido'),
    handleInputErrors,
    AuthController.validateToken
)

authRouter.post('/update-password/:token',
    body('password').isLength({ min: 8 }).withMessage('El password es muy corto, mínimo 8 caractéres'),
    body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),
    param('token').notEmpty().withMessage('Token no válido'),
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

authRouter.get('/user', authenticate, AuthController.user)

authRouter.put('/profile',
    authenticate,
    body('email').isEmail().withMessage('Email no válido'),
    body('name').notEmpty().withMessage('Debe de ingresar un nombre'),
    handleInputErrors,
    AuthController.updateUser
)

authRouter.post('/changePassword',
    authenticate,
    body('current_password').notEmpty().withMessage('Debe ingresar el password actual'),
    body('password').isLength({ min: 8 }).withMessage('El password es muy corto, mínimo 8 caractéres'),
    body('password_confirmation').custom((value, { req }) => {

        if (value !== req.body.password) {
            throw new Error('Los Password no son iguales')
        }
        return true
    }),
    handleInputErrors,
    AuthController.ChangeUserPassword
)
