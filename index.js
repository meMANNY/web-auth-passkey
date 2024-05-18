const express = require('express');
const {generateRegistrationOptions}= require("@simplewebauthn/server");
const port = 3000;

const app = express();

app.use(express.json());    // to support JSON-encoded bodies
app.use(express.static('./public'));
const userStore = {};

app.post('/register',(req,res)=>{
    const {username,password} = req.body; // destructuring  

    const id = `user_${Date.now()}`;

    const user = {
        id,
        username,
        password
    
    }

    userStore[id] = user;

    console.log("registration successful",userStore[id]);

    return res.json({id});
})

app.post("/register-challenge",(req,res)=>{

    const {userId} = req.body;

    if(!userStore[userId]){
        return res.status(404).json({error:"User not found"});
    }

    const user = userStore[userId];
    const challengePayload = generateRegistrationOptions({
        rpID: 'localhost',
        rpName: 'My localhost machine',
        username: user.username,
    });
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});