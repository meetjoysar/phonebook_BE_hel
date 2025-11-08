const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config()
// const fs = require('fs')
// const path = require('path')
// const cors = require('cors')

/*
1.import mongoos
2..env file with uri
3.connect url with mongodb
4.schema rules
5.tranforming output
6.model
*/
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
mongoose.connect(url).then(result => {
    console.log('connected to MongoDB');
}).catch(err => {
    console.log("error connecting to MongoDB", err.message);
})

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model("Person", phonebookSchema)

const app = express()
// app.use(cors())

app.use(express.static('dist'))

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

// let phonebook = [
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

app.get('/info', (req, res) => {
    let currentdate = new Date()
    let datetime = currentdate.toString()
    // console.log(d.getFullYear());
    res.send(
        `<p>Phonebook has info for ${phonebook.length} people.</p><p>${datetime}</p>`
    )
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
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

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})