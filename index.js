const express= require('express');
const cors= require('cors');
const jwt= require('jsonwebtoken')
const app = express();
const cookieParser= require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port= process.env.PORT || 5000




//middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())


const logger = async(req,res,next)=>{
  console.log('Called',req.host , req.originalURL)
  next();
}

const verifyToken= async(req,res,next)=>{
     const token= req.cookies?.token
     console.log('in veryfy token',token)
     console.log('Value fo token in middleware,',token)
     if(!token){
        return res.send({message:'Not authorized'})
     }
     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
           //error
          if(err){
            return res.status(401).send({message: 'Not Authorized'})
          }


           //if token valid then it will be decoded
           console.log('value in the token',decoded)
           req.user=decoded
           next()
     })
}






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n2g3mj5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


    const serviceCollection=client.db('cardoctor').collection('services')
    const bookingCollection= client.db('cardoctor').collection('bookings')


    //auth related API
    app.post('/jwt',verifyToken,async(req,res)=>{
         const user= req.body;
         console.log(user)
         const token= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
         res.cookie('token',token, {
          httpOnly:true,
          secure: true,
          maxAge:3600000,
          sameSite:'none',
         })
         res.send({success:true});
    })



    // services related API
    app.get('/services', async(req,res)=>{
        const cursor= serviceCollection.find()
        const result= await cursor.toArray();
        res.send(result);
    })

    app.get('/services/:id', async(req,res)=>{
        const id= req.params.id
        const query = {_id: new ObjectId(id)};

        const options={
            projection: {title:1,price:1,service_id:1,img:1}
        }


        const result = await serviceCollection.findOne(query,options);
        res.send(result);
    })



    // check out or bookings collection

    app.get('/bookings',verifyToken ,async(req,res)=>{
        console.log('In server:',req.query?.email);
        console.log('tok tok token',req.cookies.token);
        console.log('User in the valid token',req.user)
        if(req.query?.email!== req.user.email){
          return res.status(403).send({message:'Forbidden access'})
        }
        let query={};
        if(req.query?.email){
          query={Email: req.query?.email}
          console.log('query:',query)
        }
        const result= await bookingCollection.find(query).toArray()
        console.log(result)
        res.send(result)
    })

    app.delete('/bookings/:id', async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result =await bookingCollection.deleteOne(query)
      res.send(result)
    })
   


    app.post('/bookings', async(req,res)=>{
        const booking= req.body;
        console.log(booking);

        const result= await bookingCollection.insertOne(booking);
        res.send(result)
    })

    app.patch('/bookings/:id',async(req,res)=>{
       const updatedBooking= req.body;
       const id= req.params.id
       const filter= {_id: new ObjectId(id)}
       const updatedDoc={
          $set:{
             Status: updatedBooking.Status
          }
       }
       const result= await bookingCollection.updateOne(filter,updatedDoc);
       res.send(result);
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






app.get('/',(req,res)=>{
    res.send('Server for genius car working')
})

app.listen(port,()=>{
    console.log('Server is running on port ->',port);
})