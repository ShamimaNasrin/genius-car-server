const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

//middlewares
app.use(cors());
app.use(express.json());

//check user ans password working or not
// console.log(process.env.DB_USER) 
// console.log(process.env.DB_PASSWORD) 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.klfob8q.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db("geniusCar").collection("services");
        const orderCollection = client.db("geniusCar").collection("orders");

        //READ services data from MnngoDB & create services api
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        //READ one service from MnngoDB & create service api
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //send data to mongo and create orders api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        //orders api using query parameter (email)
        app.get('/orders', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });

        //update status
        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.params.status;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: status
                }
            }
            const result = await orderCollection.updateOne(query, updateDoc);
            res.send(result);
        });


    }
    finally {

    }
}
run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('genius car server is running');
})

app.listen(port, () => {
    console.log(`genius car server is running on: ${port}`);
})