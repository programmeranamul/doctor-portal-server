const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra')
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://DoctorAdmin:BlmmmxVxa8XQKAKL@cluster0.5yvtj.mongodb.net/doctorsPortal?retryWrites=true&w=majority`;



require("dotenv").config();


const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload())
const port = 8000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointments");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");

  //add appointment
  app.post('/addAppointment', (req, res) => {
    const appointment = req.body
    appointmentCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })



  app.post('/appointsByDate', (req, res) => {
    const date = req.body
    const email = req.body.email

    doctorCollection.find({ email: email })
      .toArray((err, doctors) => {

        const filter = { appointment: date.date }

        if (doctors.length === 0) {
          filter.email = email
        }

        appointmentCollection.find(filter)
          .toArray((err, document) => {
            res.send(document)
          })


      })


  })


  app.post('/addDoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const number = req.body.number;
    // const filePath = `${__dirname}/doctors/${file.name}`;
    // file.mv(filePath, err => {
    //   if (err) {
    //     console.log(err)
    //     res.status(500).send({ msg: "Filed To Save" })
    //   }

    //   const newImg = fs.readFileSync(filePath)
    //   const encImg = newImg.toString('base64')

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    const newImg = file.data


    // return res.send({name:file.name, path : `/${file.name}`})
    // doctorCollection.insertOne({ name, email, number, img: file.name })
    // doctorCollection.insertOne({ name, email, number, image })
    // .then(result => {
    //   fs.remove(filePath, error => {
    //     if(error){
    //       console.log(error);
    //       res.status(500).send({ msg: "Filed To Save" })
    //     }
    //     res.send(result.insertedCount > 0)
    //   })
    //   // res.send(result.insertedCount > 0)
    //   })

    doctorCollection.insertOne({ name, email, number, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  })



//get doctors data from database
app.get("/doctors", (req, res) => {
  doctorCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
})


//start cheek is doctor
app.post('/cheekDoctor', (req, res) => {
  const email = req.body.email

  doctorCollection.find({ email: email })
    .toArray((err, documents) => {
      res.send(documents.length > 0)
    })


})


  //end cheek is doctor



});



app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
