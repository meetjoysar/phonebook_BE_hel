const express = require('express')
const morgan = require('morgan')
// const mongoose = require('mongoose')
require('dotenv').config()
const Person = require("./models/phonebook")
const e = require('express')

const app = express()

app.use(express.static('dist'))

// morgan.token('body', (req) => {
//     return JSON.stringify(req.body)
// })

app.use(express.json())
// app.use(morgan('tiny', { stream: accessLogStream }))
// app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('----------------------')
  next()
}
app.use(requestLogger)

app.get('/info', (req, res) => {
    Person.countDocuments({}).then(count => {
        let datetime = new Date().toString()
        res.send(
            `<p>Phonebook has info for ${count} people.</p><p>${datetime}</p>`
        )
    })
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    Person.findById(id).then(person => {
        res.json(person)
    }).catch(err => next(err))
})


app.post('/api/persons', (req, res) => {
    let name_2put = req.body.name
    let number_2put = req.body.number

    if (!name_2put) {
        return res.status(400).json({
            error: "name-missing"
        })
    }
    else if (!number_2put){
        return res.status(400).json({
            error: "number-missing"
        })
    }

    const person = new Person({
        name: name_2put,
        number: number_2put
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (req, res) => {
    // const id = req.params.id
    // phonebook = phonebook.filter(person => person.id !== id)

    // res.status(204).end()
    Person.findByIdAndDelete(req.params.id).then(result => {
        res.status(204).end()
    }).catch(err => next(err))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message);
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformated id' })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})