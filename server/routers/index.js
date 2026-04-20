import express from 'express';
import multer from 'multer';
import registrationRouter from './registrationRoute.js';
import loginRouter from './loginRoute.js';
import adminRouter from './adminRoute.js';
import avatarRouter from './avatarRoute.js';
import AIRouter from './AISummarizeRoute.js';
import searchController from '../controllers/SearchController.js';
import materialController from '../controllers/MaterialController.js';
import LoginController from '../controllers/LoginController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.use('/registration', registrationRouter)

router.use('/login', loginRouter)

router.use('/admin', adminRouter)

router.use('/profile', avatarRouter)

router.get('/searchUsers', searchController.getAllUsers)

router.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: "Profile is accessed" })
})

router.get('/home', authMiddleware, (req, res) => {
    res.json({ message: "Home page is accessed" });
})

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        return res.json({ message: "User logout success"})
    });
    console.log(req.session);
})

router.get("/me", authMiddleware, LoginController.getUserAuthInfo);

router.post("/material", authMiddleware, materialController.createMaterial);

router.get("/all-materials", authMiddleware, searchController.getAllMaterials);

router.get("/user-all-materials", authMiddleware, materialController.getUserMaterials);

router.get("/materials/:id", authMiddleware, materialController.getMaterialById);

router.post("/material/upload-pdf", authMiddleware, upload.single("pdfFile"), materialController.createFromPdf);

router.get("/search", authMiddleware, searchController.search);

router.use("/", authMiddleware, AIRouter);

export default router;