/*
1.import mongoos
2..env file with uri
3.connect url with mongodb
4.schema rules
5.tranforming output
6.model
*/
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to ',url)

mongoose.connect(url).then(() => {
    console.log('connected to MongoDB -->')
}).catch(err => {
    console.log('error connecting to MongoDB', err.message)
})

const phonebookSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        validate: {
            validator: (v) => {
                return /^\d{2,3}-\d{5,}$/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        },
        required: true
    },
})

phonebookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', phonebookSchema)