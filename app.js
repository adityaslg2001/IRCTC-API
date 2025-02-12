const express= require("express");
const app= express();
const cors= require("cors");
const helmet= require("helmet");

const rateLimit= require("express-rate-limit");
const pool= require("./database");
const dotenv= require("dotenv");


dotenv.config();

// ------------>> Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 100, //------------>every ip will get 100 req 
  })
);

//----------------->> Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const trainRoutes = require("./routes/train");
const bookingRoutes = require("./routes/booking");

app.use("/api/v1/auth", authRoutes);       


app.use("/api/v1/admin", adminRoutes);    
app.use("/api/v1/trains", trainRoutes);        



app.use("/api/v1/booking", bookingRoutes);    


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});
pool.getConnection()
  .then(connection => {
    console.log("Database connected successfully!");
    connection.release(); 
  })
  .catch(err => {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
