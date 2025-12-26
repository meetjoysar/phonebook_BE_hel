//starting with ex 3.17 from here
const express = require('express')
require('dotenv').config()
const Person = require("./models/phonebook")

const app = express()

app.use(express.static('dist'))

app.use(express.json())

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

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id
    Person.findById(id).then(person => {
        res.json(person)
    }).catch(err => next(err))
})


app.post('/api/persons', (req, res) => {
    let name_2post = req.body.name
    let number_2post = req.body.number

    if (!name_2post) {
        return res.status(400).json({
            error: "name-missing"
        })
    }
    else if (!number_2post){
        return res.status(400).json({
            error: "number-missing"
        })
    }

    const newperson = new Person({
        name: name_2post,
        number: number_2post
    })

    newperson.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    let id_2put = req.params.id
    let num_2put = req.body.number
    Person.findByIdAndUpdate(id_2put, { number: String(num_2put) }, { new: true}).then(results => {
        // always do this to comple the hanging request
        res.json(results)
    }).catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id).then(result => {
        res.json(result)
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