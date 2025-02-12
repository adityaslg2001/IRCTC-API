const pool = require("../database");

// for only admin ..... only he will add train 
const addTrain = async(req, res, next)=>{
  try {
    const { train_no,train_name, source, destination, total_seats } = req.body;
    const available_seats= total_seats;
    const [result] = await pool.query("INSERT INTO train (train_no, train_name, source, destination, total_seats, available_seats) VALUES (?,?,?,?,?,?)",[train_no, train_name, source, destination, total_seats, available_seats]
    // [train_no, train_name, source, destination, total_seats, available_seats]
    );
    const trainId = result.insertId;
    res.status(201).json({ message: "Train added", trainId });
  } catch (error) {
    next(error);
  }
};
const getAvailability= async (req, res, next) => {
  try   {
    const {source,destination}= req.query;
    if (!source||!destination) {
      return res.status(400).json({message: "source and destination required"});
    }
    
    const [trains] = await pool.query("SELECT * FROM train WHERE source = ? AND destination = ?",[source, destination]
);
    res.json(trains);
  } catch (error) {
    next(error);
  }
};

module.exports = {addTrain,getAvailability};
