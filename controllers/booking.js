const pool = require("../database");

const bookSeat = async (req, res, next) => {
  const { trainId, numberOfSeats } = req.body;
  const userId = req.user.id; //coming   from auth middlew

  if (!trainId||!numberOfSeats) {
    return res.status(400).json({message: "trainId and numberOfSeats are required" });
  }

  if (!userId){
    return res.status(400).json({message: "User not authenticated" });
  }
  const connection = await pool.getConnection();

// connection.beginTransaction();
  try   {
    
    await connection.beginTransaction();

    
    const [rows] = await connection.query("SELECT available_seats FROM train WHERE id = ? FOR UPDATE",[trainId]);
    if(rows.length=== 0) {
      await connection.rollback();


      return res.status(404).json({ message: "Train not found"});
    }
    // if (available_seats <= numberOfSeats) {
    //     return res.status(400).json({ message: "Not enough seats available" });
    //   }
    const available_seats= rows[0].available_seats;
    if (available_seats<numberOfSeats){
      await connection.rollback();
      return res.status(400).json({message: "Not enough seats available"});
    }

    //we will reduce thw booked seats from avail seats
    await connection.query("UPDATE train SET available_seats = available_seats - ? WHERE id = ?",[numberOfSeats,trainId]);





    const [result]= await connection.query("INSERT INTO bookings (userId, trainId, numberOfSeats) VALUES (?, ?, ?)",[userId, trainId, numberOfSeats]);
    const bookingId= result.insertId;

    await connection.commit();

    res.status(201).json({ message: "Booking successful", bookingId});
  } catch(error){
    await connection.rollback();
    next(error);
  }finally
  {
    connection.release();
  }
};

const getBookingDetails = async (req, res, next) => {
  const bookingId = req.params.id;
  const userId = req.user.id;

  try {

    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ? AND userId = ?",[bookingId,userId]);
    if(rows.length=== 0) {
    return res.status(404).json({message: "Booking not found"});
    }
    res.json(rows[0]);
  } 
  
  catch (error) {
    next(error);
  }
};

module.exports = {bookSeat,getBookingDetails};
