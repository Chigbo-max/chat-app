import express from 'express';
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/concrete/AuthService";

const authService = new AuthService();
const authController = new AuthController(authService);

const router = express.Router();


router.post("/register",  (req, res) =>
    authController.register(req, res)
  );
  
  router.post("/login", (req, res) =>
    authController.login(req, res)
  );

  export default router;