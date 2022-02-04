const express = require('express'); // import express module
const app = express(); // create app instance
const dotenv = require('dotenv'); // import env module
dotenv.config(); // initialised configuration to read .env and other files
const secret = process.env.SECRET; // secret to set token
const port = process.env.PORT || 3000; // port
const jwt = require('jsonwebtoken'); // jwt importing 

app.use(express.json()); // this helps read json files

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

let refreshTokens = [];

const generateToken = (user) => jwt.sign({id:user.id, isAdmin:user.isAdmin}, secret, {expiresIn: "15s"})
const regenerateToken = (user) => jwt.sign({id:user.id, isAdmin:user.isAdmin}, secret+"extra")

app.post('/refresh', (req, res) =>{
    const refreshToken = req.body.token;

    if(!refreshToken ) return res.status(401).json("You are not authenticated.")
    if(!refreshTokens.includes(refreshToken)){
        return res.status(403).json("Refresh token is not valid.")
    }
    jwt.verify(refreshToken, secret+"extra", (err, user) => {
        err && console.log(err);
        refreshTokens = refreshTokens.filter((token) => token != refreshToken);

        const newAccessToken = generateToken(user);
        const newRefreshToken = regenerateToken(user);

        refreshTokens.push(newRefreshToken);

        res.status(200).json({
            accessToken : newAccessToken,
            refreshToken : newRefreshToken
        })

    })
})

app.post("/login", (req, res) =>{
    // res.json("hey it works")
    const {username, password} = req.body;
    const user = users.find(user => {
        return user.username === username && user.password === password;
    });
    if(user){
        // res.json(user);
        // Generate access token
        // const accessToken = jwt.sign({id:user.id, isAdmin:user.isAdmin}, secret, {expiresIn: "15s"}); //creating access token which has the encrypted data

        const accessToken = generateToken(user);
        const refreshToken = regenerateToken(user);
        refreshTokens.push(refreshToken);

        res.json({
                username : user.username,
                isAdmin : user.isAdmin,
                accessToken,
                refreshToken
            });

    } else {
        res.status(400).json("Invalid User!");
    }
})

const verify = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if (authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, secret, (err, body) => {
            if (err) {
                return res.status(403).json("Token is not valid!");
            }
            req.user = body;
            next();
        });
    } else {
        res.status(401).json("You are not authorized.")
    }
}

app.delete("/users/:userId", verify, (req, res) =>{
    if (req.user.id === req.params.userId || req.user.isAdmin) {
        res.status(200).json("Deleted successfully")
    } else {
        res.status(403).json("You are not allowed to delete this user.")
    }
})

app.listen(port, () => console.log("Backend server is running on", port));