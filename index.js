const express = require('express');
const crypto = require('node:crypto');
const {generateRegistrationOptions, verifyRegistrationResponse}= require("@simplewebauthn/server");

    if(!globalThis.crypto){
        globalThis.crypto = crypto;
    
    }

const port = 3000;

const app = express();

app.use(express.json());    // to support JSON-encoded bodies
app.use(express.static('./public'));
const userStore = {};
const challengeStore = {};
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

app.post("/register-challenge",async (req,res)=>{

    const {userId} = req.body;

    if(!userStore[userId]){
        return res.status(404).json({error:"User not found"});
    }

    const user = userStore[userId];

    //create the challenge
    const challengePayload =  await generateRegistrationOptions({
        rpID: 'localhost',
        rpName: 'My localhost machine',
        username: user.username,
    });
    // store the challenge
    challengeStore[userId] = challengePayload.challenge

    return res.json({options: challengePayload});
})

app.post("/register-verify", async(req,res)=>{
    const {userId,cred}= req.body;

    if(!userStore[userId]){
        return res.status(404).json({error:"User not found"});
    }

    const user = userStore[userId];
    const challenge = challengeStore[userId];

    const verificationResult = await verifyRegistrationResponse({
        expectedChallenge: challenge,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        response: cred,
    })

    if(!verificationResult.verified){
        return res.status(401).json({error:"Credential verification failed"});
    }

    userStore[userId].passkey = verificationResult.registrationInfo;

    return res.json({verified:true});

})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});