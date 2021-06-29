const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require("mongodb").ObjectID;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbarr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(express.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("Hello Ismail Hossen, your DoctorPatientPortal is connected DB")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("DoctorPatientPortal").collection("appointments");
    const doctorCollection = client.db("DoctorPatientPortal").collection("doctors");

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/appointmentsByDate', (req, res) =>{
        const date = req.body;
        console.log(date.date);
        appointmentCollection.find({date: date.date})
        .toArray((err, documents)=>{
            res.send(documents)
        })
    })

    app.post('/addADoctor', (req, res) => {
        const newDoctor = req.body;
        console.log("Adding new doctor: ", newDoctor);
        doctorCollection.insertOne(newDoctor).then((result) => {
            console.log("inserted count: ", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

// Delete Booking
  app.delete("/deleteBook/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("delete this", id);
    appointmentCollection.deleteOne({ _id: id }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });

});


app.listen(process.env.PORT || port)
