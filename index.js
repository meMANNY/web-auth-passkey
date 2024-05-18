const express = require('express');

const port = 3000;

const app = express();

app.use(express.json());    // to support JSON-encoded bodies

const userStore = {};

app.post('/register',(req,res)=>{
    const {username,password} = req.body; // destructuring  

    const id = `${Date.now()}`;

    const user = {
        id,
        username,
        password
    
    }

    userStore[id] = user;

    console.log("registration successful",userStore[id]);

    return res.json({id});
})

app.use(express.static('./public'));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});