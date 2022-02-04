const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const secret = process.env.SECRET;
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');

app.use(express.json());

const users = [
    {
        id : "1",
        username : "Anupam",
        password : "anupam1234",
        isAdmin : true
    },
    {
        id : "2",
        username : "Arya",
        password : "arya1234",
        isAdmin : false
    }
]

app.post("/login", (req, res) =>{
    // res.json("hey it works")
    const {username, password} = req.body;
    const user = users.find(user => {
        return user.username === username && user.password === password;
    });
    if(user){
        // res.json(user);
        // Generate access token
        const accessToken = jwt.sign({id:user.id, isAdmin:user.isAdmin}, secret);
        res.json({
            username : user.username,
            isAdmin : user.isAdmin,
            accessToken
        });
    } else {
        res.status(400).json("Invalid User!");
    }
})

app.listen(port, () => console.log("Backend server is running on", port));