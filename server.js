// general dependencies
const express = require('express');
const fs = require('fs');

const app = express()
const cors = require('cors')

const path = require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors())

const owner = "CyBizpsEVPjycYiaCMaDQFkHJWrPZJsBYWeYTz3JYVPX";

const wl = ['http://localhost:3000', 'http://localhost:8080', 'https://sleepy-atoll-58033.herokuapp.com/']
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin)
    if (wl.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))

const startWhitelist = (num) => {
    let whitelist = fs.readFileSync('whitelist', 'utf-8').split('\n');
    whitelist.push(owner);

    let mintsLeftDB = {};
    whitelist.forEach(x => {
        mintsLeftDB[x] = num;
    });
    fs.writeFileSync('mintsLeftDB.json', JSON.stringify(mintsLeftDB));
    fs.writeFileSync('transactionsDB.json', JSON.stringify({}));
}

app.get('/', (req, res) => {
    
    res.send("Hello There!")
})

const registerMint = (num, address, signature) => {
    let mintsLeftDB = JSON.parse(fs.readFileSync('mintsLeftDB.json', 'utf-8'));
    let transactionsDB = JSON.parse(fs.readFileSync('transactionsDB.json', 'utf-8'));

    mintsLeftDB[address] -= num;
    transactionsDB[address] = {signature, num_minted: num};

    fs.writeFileSync('mintsLeftDB.json', JSON.stringify(mintsLeftDB));
    fs.writeFileSync('transactionsDB.json', JSON.stringify(transactionsDB));
}

app.post('/getMintsLeft', (req, res) => {
    let address = req.body.address;
    let mintsLeftDB = JSON.parse(fs.readFileSync('mintsLeftDB.json', 'utf-8'));
    
    res.send({mints_left: mintsLeftDB[address]})
})

app.post('/registerMint', (req, res) => {
    let {num, address, signature} = req.body;
    
    registerMint(num, address, signature);

    res.end();
})

app.get('/getTransactions', (req, res) => {
    
    res.send(JSON.parse(fs.readFileSync('transactionsDB.json', 'utf-8')));
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}


const PORT = process.env.PORT || 4000
app.listen(PORT, (req, res) => {
    startWhitelist(10);
    console.log(`server listening on port: ${PORT}`)
  });