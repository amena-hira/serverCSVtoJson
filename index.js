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
    data.map(async (data) => {
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
                    res.json({ success: 'success' })
                })
                .catch(error => console.log(error));
        })

        app.get('/showData', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            console.log(page, size);
            const query = {};
            const movies = await moviesCollection.find(query).skip(page * size).limit(size).sort({_id:-1}).toArray();
            const count = await moviesCollection.estimatedDocumentCount();
            res.send({ count, movies })
        })
        app.get('/search', async (req, res) => {
            const film = req.query.film;
            const query = {};
            console.log(film);
            const movie = await moviesCollection.findOne({ Film: film });
            const movies = [movie];
            const count = 1;
            res.send({ count, movies })
        })
        app.post('/addMovie', async (req, res) => {
            const movie = req.body;
            const query = {};
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const result = await moviesCollection.insertOne(movie);
            const movies = await moviesCollection.find(query).skip(page * size).limit(size).sort({_id:-1}).toArray();
            const count = await moviesCollection.estimatedDocumentCount();
            res.send({ count, movies })
        })
        app.patch('/editMovie/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    Film: req.body.film,
                    Genre: req.body.genre,
                    "Lead Studio": req.body.lead,
                    "Audience score %": req.body.audience,
                    Profitability: req.body.profit,
                    "Rotten Tomatoes %": req.body.rotten,
                    "Worldwide Gross": req.body.gross,
                    Year: req.body.year
                }
            }
            const result = await moviesCollection.updateOne(query, updatedDoc);
            const movie = await moviesCollection.findOne(query);
            const movies = [movie];
            const count = 1;
            res.send({ count, movies })
        })
        app.delete('/deleteMovie/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await moviesCollection.deleteOne(filter);
            res.send(result);
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