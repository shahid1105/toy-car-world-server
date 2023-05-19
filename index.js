const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;



// middleware 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.CARTOY_USER}:${process.env.CARTOY_PASS}@cluster0.08jlhdc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const CarToysCollection = client.db("toyCar").collection('alltoys');


        // Creating index on one fields
        const indexKeys = { ToyName: 1, };
        const indexOptions = { name: "toyName" };
        const result = await CarToysCollection.createIndex(indexKeys, indexOptions);
        console.log(result);
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        app.get("/search/:text", async (req, res) => {
            const text = req.params.text;
            const result = await CarToysCollection
                .find({
                    $or: [
                        { ToyName: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });


        app.get("/alltoys/:text", async (req, res) => {
            console.log(req.params.id);
            const toys = await CarToysCollection
                .find({
                    subCategory: req.params.category,
                })
                .toArray();
            res.send(toys);
            console.log(toys);
        });


        app.get('/alltoys', async (req, res) => {
            const cursor = CarToysCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })



        app.post('/alltoys', async (req, res) => {
            const allToys = req.body;
            console.log(allToys);
            const result = await CarToysCollection.insertOne(allToys);
            res.send(result)
        })









        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Toy Car World server is running')
})


app.listen(port, () => {
    console.log(`Toy Car World server is running on port: ${port}`);
})