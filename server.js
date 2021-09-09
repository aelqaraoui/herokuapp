// general dependencies
const express = require('express');
const fs = require('fs');

const app = express()
const cors = require('cors')

const path = require('path');



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