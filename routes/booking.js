const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authentication");
const { bookSeat, getBookingDetails } = require("../controllers/booking");

//for booking seat...omly those who have logged in
router.post("/book",authenticateToken,bookSeat);

router.get("/:id",authenticateToken,getBookingDetails);

module.exports= router;
