const pool = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const register = async (req, res, next) => {
  try {
    // const { name, email, password } = req.body;
    const {name, email, password, role} = req.body;
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?",[email]);
    if(existing.length>0){
      return res.status(400).json({ message: "User already exists" });
    }

    // Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);


    // const [result] = await pool.query("INSERT INTO user (name, email, password, role) VALUES (?, ?, ?)",[name,email,hashedPassword || "user"]);
    const [result] = await pool.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",[name,email,hashedPassword,role || "user"]);
    const userId = result.insertId;

    //JWT Gen
    const token = jwt.sign({id: userId, name, role: role || "user"},
        process.env.JWT_SECRET,{expiresIn: "30d"});

    res.status(201).json({ id: userId, name, email, role: role || "user", token });
      } catch (error) {
    next(error);
      }
};

// Agar pehle se logged hai
const login = async (req, res, next) => {
  try {
    const {email,password} = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
    return res.status(400).json({message: "Invalid username or pass"});
    }



    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({message: "Invalid username or pass"});
        }
    // if (!isMatch) {
    //   return res.status(400).json({});
    // }
    const token = jwt.sign({id: user.id, name:user.name, role:user.role},process.env.JWT_SECRET,{expiresIn: "30d"});
    res.json({id: user.id, name: user.name, email: user.email, role: user.role, token});
  } catch(error) {
    next(error);
  }
};

module.exports = {register,login};
