const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.port || 5000;
const csvtojson = require('csvtojson');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwbwt8c.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function dataAddDB(data, collectionName) {
    data.map(async(data) => {
        const result = await collectionName.insertOne(data);
    })
    console.log('ok');
}
async function run() {
    try {
        const moviesCollection = client.db('csvToJson').collection('movies');

        app.post('/addData', async (req, res) => {
            csvtojson().fromFile('movies.csv')
                .then(csvData => {
                    console.log(csvData.length);
                    dataAddDB(csvData, moviesCollection)
                    res.json({success: 'success'})
                })
                .catch(error=>console.log(error));
        })
    }
    finally {

    }
}
run().catch(error => console.log(error))


app.get('/', async (req, res) => {
    res.send('server is running');
})

app.listen(port, () => console.log(`Server running on ${port}`))