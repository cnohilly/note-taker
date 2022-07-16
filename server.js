const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// home page for application
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// page for the notes being taken or saved
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req,res) => {
    fs.readFile('./db/db.json','utf8', (err,data) => {
        if (err) throw err;
        res.json(JSON.parse(data));
    })
});

app.post('/api/notes', (req,res) => {
    fs.readFile('./db/db.json','utf-8', (err,data) => {
        if (err) throw err;
        data = JSON.parse(data);
        data.push(req.body);
        fs.writeFile('./db/db.json',JSON.stringify(data), (err) => {
            if (err) throw err;
        });
        res.json(req.body);
    });
});


app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
