const express = require('express')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors())

// const accessLogStream = fs.createWriteStream(
//     path.join(__dirname, 'access.log'), 
//     { flags: 'a' }  // 'a' means append
// )

morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})

app.use(express.json())
// app.use(morgan('tiny', { stream: accessLogStream }))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let phonebook = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info', (req, res) => {
    let currentdate = new Date()
    let datetime = currentdate.toString()
    // console.log(d.getFullYear());
    res.send(
        `<p>Phonebook has info for ${phonebook.length} people.</p><p>${datetime}</p>`
    )
})

app.get('/api/persons', (req, res) => {
    res.json(phonebook)
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    const person = phonebook.find(p => p.id === id)
    if (person){
        res.json(person)
    } else {
        res.status(404).end("Invalid!")
    }
})

const generateId = () =>{
    const maxId = phonebook.length > 0
        ? Math.max(...phonebook.map(p => Number(p.id)))
        : 0
    return String(maxId + 1)
}

app.post('/api/persons', (req, res) => {
    let name = req.body.name
    let number = req.body.number

    if (!name) {
        return res.status(400).json({
            error: "name-missing"
        })
    }
    else if (!number){
        return res.status(400).json({
            error: "number-missing"
        })
    }
    //could have used .some() instaed of this compelx logic
    let alreadyPresent = phonebook.map(p => p.name.split(' ').join('').toLowerCase()).includes(name.split(' ').join('').toLowerCase())
    console.log(alreadyPresent);

    if (alreadyPresent) {
        return res.status(409).json({
            error: "already present"
        })
    }

    let person = {
        id: generateId(),
        name: name,
        number: number
    }

    phonebook = phonebook.concat(person)

    res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id
    phonebook = phonebook.filter(person => person.id !== id)

    res.status(204).end()
})



const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})