const Router = require('express')
const multer = require('multer');

const router = new Router()
const registrationRouter = require('./registrationRoute')
const loginRouter = require('./loginRoute')
const adminRouter = require('./adminRoute')
const avatarRouter = require('./avatarRoute');
const AIRouter = require('./AISummarizeRoute');

const searchController = require('../controllers/SearchController');
const materialController = require('../controllers/MaterialController');
const LoginController = require('../controllers/LoginController');

const authMiddleware = require('../middleware/authMiddleware'); 

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

module.exports = router;