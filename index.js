const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


        app.get("/search/:text", async (req, res) => {
            const text = req.params.text;
            const result = await CarToysCollection
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });


        app.get("/alltoys/:text", async (req, res) => {
            if (req.params.text == "RegularCarToys" || req.params.text == "TruckToys" || req.params.text == "PoliceCarToys" || req.params.text == "FireTruckToys" || req.params.text == "sportsToys") {

                const toys = await CarToysCollection
                    .find({
                        subCategory: req.params.text
                    })
                    .toArray();
                res.send(toys);
            }


        });


        app.get('/alltoys', async (req, res) => {
            const cursor = CarToysCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })



        app.post('/alltoys', async (req, res) => {
            const allToys = req.body;
            const result = await CarToysCollection.insertOne(allToys);
            res.send(result)
        })


        app.get('/mytoys/:email', async (req, res) => {
            const result = await CarToysCollection.find({ sellerEmail: req.params.email }).toArray();

            res.send(result)
        })


        app.get('/mytoy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await CarToysCollection.findOne(query)
            res.send(result)
        })

        app.put('/mytoy/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            console.log(toy);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToy = {
                $set: {
                    availableQuantity: toy.availableQuantity,
                    description: toy.description,
                    img: toy.img,
                    price: toy.price
                }
            }
            const result = await CarToysCollection.updateOne(filter, updatedToy, options)
            console.log(result);
            res.send(result)


        })



        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await CarToysCollection.findOne(query)
            res.send(result)
        })

        app.delete('/mytoys/:id', async (req, res) => {
            const id = req.params.id;
            console.log('please delete from database', id);
            const query = { _id: new ObjectId(id) }
            const result = await CarToysCollection.deleteOne(query)
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