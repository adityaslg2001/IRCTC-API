const express= require("express");
const router= express.Router();
const adminAuth= require("../middleware/adminAuth");
const {addTrain}= require("../controllers/train");

//for just admin 
router.post("/train",adminAuth,addTrain);

module.exports= router;
