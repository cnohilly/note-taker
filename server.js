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

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        if (!data){
            data = [];
        } else {
            data = JSON.parse(data);
        }
        res.json(data);
    })
});

app.post('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if (err) throw err;
        if (!data){
            data = [];
        } else {
            data = JSON.parse(data);
        }
        data.push(req.body);
        fs.writeFile('./db/db.json', JSON.stringify(data), (err) => {
            if (err) throw err;
        });
        res.json(req.body);
    });
});

app.delete('/api/notes/:id', (req, res) => {
    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if (err) throw err;
        if (!data){
            data = [];
        } else {
            data = JSON.parse(data);
        }
        const noteId = req.params.id;
        console.log(noteId);
        for (let i = 0; i < data.length; i++) {
            if (data[i].id == noteId) {
                data.splice(i, 1);
                fs.writeFile('./db/db.json', JSON.stringify(data), (err) => {
                    if (err) throw err;
                    console.log('Item removed and database saved.');
                });
                res.json('Note has been deleted');
            }
        }
    })
});


app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);
