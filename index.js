const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const { urlencoded } = require('express');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle weares
app.use(cors());
app.use(express.json());
app.use(fileUpload());

//mongodb connection tools
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y4qnm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// crud operations
async function run() {
    try {
        await client.connect();
        // db collections
        const database = client.db("savon");
        const soapCollection = database.collection("soaps");
        const customerCollection = database.collection("customers");
        const userCollection = database.collection("users");
        const reviewCollection = database.collection("reviews");

        // insert data api with img bb
        app.post('/soaps', async (req, res) => {
            const soap = req.body;
            const result = await soapCollection.insertOne(soap);
            res.send(result);
        })

        // insert data with live image 
        // app.post('/soaps', async (req, res) => {
        //     const doc = req.body;
        //     const pic = req.files.image;
        //     const picData = pic.data;
        //     const encodedPic = picData.toString('base64');
        //     const image = Buffer.from(encodedPic, 'base64');
        //     const product = { image, ...doc };
        //     console.log(product);
        //     // const soap = req.body;
        //     const result = await soapCollection.insertOne(product);
        //     res.send(result);
        // })

        // get all data api 
        app.get('/soaps', async (req, res) => {
            const query = parseInt(req.query?.size);
            const cursor = soapCollection.find({}).sort({ "_id": -1 });
            let result;
            if (query) {
                result = await cursor.limit(query).toArray();
            }
            else {
                result = await cursor.toArray();
            }
            res.send(result);
        })

        // get single data api 
        app.get('/soaps/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await soapCollection.findOne(query);
            res.send(result);
        })

        // delete single data api 
        app.delete('/soaps/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await soapCollection.deleteOne(query);
            res.send(result);
        })

        //post customers
        app.post('/customers', async (req, res) => {
            const doc = req.body;
            const result = await customerCollection.insertOne(doc);
            res.send(result);
        })

        //get customers
        app.get('/customers', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };

            let result;
            if (email) {
                const cursor = customerCollection.find(query).sort({ "_id": -1 });
                result = await cursor.toArray();
            }
            else {
                const cursor = customerCollection.find({}).sort({ "_id": -1 });
                result = await cursor.toArray();
            }
            res.send(result);
        })

        //cancel customer order
        app.delete('/customers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await customerCollection.deleteOne(query);
            res.send(result);
        });

        //update customer order status
        app.put('/customers/:id', async (req, res) => {
            const id = req.params.id;
            const doc = req.body;
            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: doc };
            const options = { upsert: true };
            const result = await customerCollection.updateOne(query, updateDoc, options);
            res.send(result);
        });

        //post users
        app.post('/users', async (req, res) => {
            const doc = req.body;
            const result = await userCollection.insertOne(doc);
            res.send(result);
        });

        //get users
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //update users
        app.put('/users', async (req, res) => {
            const doc = req.body;
            const filter = { email: doc.email };
            const options = { upsert: true };
            const updateDoc = { $set: doc };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //update users as admin
        app.put('/users/admin', async (req, res) => {
            const doc = req.body;
            const filter = { email: doc.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        //post review
        app.post('/reviews', async (req, res) => {
            const doc = req.body;
            const result = await reviewCollection.insertOne(doc);
            res.send(result);
        });

        //get review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


//default api's
app.get('/', (req, res) => {
    res.send('Databse is live');
});

app.listen(port, () => {
    console.log('DB is running on port', port);
});
//heroku deployed
//server:           
