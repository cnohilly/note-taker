const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const NOTES_DB_PATH = './db/db.json';

// get the next available number to use for an id
function getNoteId(notes) {
    // first id to be used
    let id = 1;
    // notes should an array so this conditional will return true as long as notes is not empty
    if (notes) {
        // maps the ids of each note into an array
        const noteIds = notes.map((note) => { return note.id; });
        // while the id is already in use, the id will increment
        while (noteIds.indexOf(id) >= 0) {
            id++;
        }
    }
    // returns the lowest available id not currently in use
    return id;
}

function saveNotes(data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(NOTES_DB_PATH, JSON.stringify(data), err => {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                ok: true,
                message: 'Notes have been saved to the database.'
            })
        })
    });
}

function readNotes() {
    return new Promise((resolve, reject) => {
        fs.readFile(NOTES_DB_PATH, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            if (!data) {
                data = [];
            } else {
                data = JSON.parse(data);
            }
            resolve({
                ok: true,
                message: 'Notes file read',
                data: data
            });
        });
    });

}

// home page for application
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// page for the notes being taken or saved
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
    readNotes().then((readResponse) => {
        res.json(readResponse.data);
    });
});

app.post('/api/notes', (req, res) => {
    readNotes().then((readResponse) => {
        let data = readResponse.data;
        const { title, text } = req.body;
        const newNote = {
            title: title,
            text: text,
            id: getNoteId(data)
        }
        data.push(newNote);
        return saveNotes(data);
    }).then((writeResponse) => {
        res.json('Saved new note.');
    }).catch(err => {
        console.log(err);
        res.json('Failed to save new note.');
    });
});

app.delete('/api/notes/:id', (req, res) => {
    readNotes().then((readResponse) => {
        let data = readResponse.data;
        const noteId = req.params.id;
        for (let i = 0; i < data.length; i++) {
            if (data[i].id == noteId) {
                data.splice(i, 1);
                return saveNotes(data);
            }
        }
        throw new Error('Invalid ID. Failed to delete note.');
    }).then((writeResponse) => {
        res.json('Note deleted from the database.');
    }).catch(err => {
        console.log(err);
        res.json(err.message);
    })
});


app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);
