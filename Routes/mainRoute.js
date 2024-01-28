const router = require("express").Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {createResponse} = require("../Controllers/mainController");

router.post("/processImage",upload.single('image'),createResponse);

module.exports = router;