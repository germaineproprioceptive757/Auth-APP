import express from "express";
import { userAuth } from "../middleware/userAuth.js";
import { getUserData } from "../controllers/userController.js";

const userRouter = express.Router();

// Placeholder for user-related routes
userRouter.get('/profile', userAuth, getUserData);

export default userRouter;