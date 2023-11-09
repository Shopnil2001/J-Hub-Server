const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.necrkau.mongodb.net/?retryWrites=true&w=majority`;

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
    const JobCollection = client.db('JobHunt').collection('jobs');
    const ApplyCollection = client.db('JobHunt').collection('apply');


    app.get('/jobs',async(req, res)=>{
      let query ={};
      if(req.query?.loggedInUserEmail){
        query ={loggedInUserEmail :req.query.loggedInUserEmail }
        
      }
      
      const cursor = JobCollection.find(query)
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/jobs/:id',async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      console.log(query);
     
      const result = await JobCollection.findOne(query);
      res.send(result)
    })

    
    app.put('/jobs/:id',async(req, res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const options ={upsert : true}
      const updated = req.body;
      console.log(updated);
      const job ={
        $set: {
           jobTitle :updated.jobTitle,
           pictureUrl:updated.pictureUrl,
           salaryRange:updated.salaryRange,
           jobDescription:updated.jobDescription,
           jobCategory:updated.jobCategory,
           loggedInUserEmail:updated.loggedInUserEmail,
           applicationDeadline:updated.applicationDeadline,
           jobPostingDate:updated.jobPostingDate,
           jobApplicantsNumber:updated.jobApplicantsNumber
        }
      }
      const result = await JobCollection.updateOne(filter, job, options);
      res.send(result)
    })


    app.post('/jobs', async(req, res)=>{
      const newJob = req.body;
      
      const result = await JobCollection.insertOne(newJob);
      res.send(result)
    });


    app.post('/apply', async(req, res)=>{
      const Applicant = req.body;

      const result = await ApplyCollection.insertOne(Applicant);
      res.send(result)
    });
    app.get('/apply',async(req, res)=>{
      let query ={};
      if(req.query?.email){
           query ={email :req.query.email
             }
      }
      if(req.query?.jobCategory){
        query ={
          email :req.query.email,
          jobCategory:req.query.jobCategory
          }
        }
      
      const cursor = ApplyCollection.find(query)
      const result = await cursor.toArray();
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




app.get('/',(req, res) =>{
    res.send('Server is running')
})

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);

})
