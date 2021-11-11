const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle weares
app.use(cors());
app.use(express.json());

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

        // insert data api 
        app.post('/soaps', async (req, res) => {
            const soap = req.body;
            const result = await soapCollection.insertOne(soap);
            res.send(result);
        })

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
//server: https://savon-server-sider-api.herokuapp.com/
