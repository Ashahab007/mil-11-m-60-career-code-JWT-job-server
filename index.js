const cors = require("cors");
const express = require("express");
// 4.0 My requirement is after install jsonwebtoken import jwt from repo documentation
const jwt = require("jsonwebtoken");
// 3.1  import cookie-parser
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3000;

// 1.0 We are applying JWT (jsonwebtoken) in careercode project that's why to clearly understand the jwt we have delete the all comment to understand how to apply jwt.

// 2.0 How jwt works?
// when client is call any api the server sent a token (AccessToken) and in client side the token is saved using HTTPOnlyCookies (Best method) or localStorage (not a best method). When user want to get the user's data like  jobsApply etc every time cookies is sent to server. then server decide if the user is authentic it will send the data. sometimes another token is also sent which is called refresh token. This refresh token works by renew the access token.

// 3.0 How to install?
// go to jwt website => Libraries => filter to node.js. Now copy the npm install jsonwebtoken or u can go to the view repo for setup documentation and run in server side. also install cookie-parser by npm i cookie-parser and import it in 3.1.

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
// 4.7 in the cors middleware set the origin which is the client side root address and {credentials: true}
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.use(express.json());
// 4.10 use the cookie parser.
app.use(cookieParser()); // Now go to website myapllication and reload it then in the server terminal u will get "Inside application api [Object: null prototype] {}" i.e server

// 5.0 Now our requirement is to verify the token. That's why created a custom middleware which takes 3 parameter req, res, next. এখানে logger দিয়ে check করা হচ্ছে যে api টা logger টাকে hit করে কিনা।

const logger = (req, res, next) => {
  console.log("inside the logger middleware");
  // 5.2 then call the next(). যদি আমার কাছে অনেক গুলো middleware থাকে তাহলে একটার পর একটা তে জেতে থাকবে using next()
  next();
};

// 6.0 finally we are going to verify the token
const verifyToken = (req, res, next) => {
  console.log("cookie in the middleware", req.cookies);
  // 6.2 (first get the token via middleware) call the next from this step reload the myapllication page and in server terminal u will get the the token message "cookie in the middleware {token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFzaGFoYWIwMDdAZ21haWwuY29tIiwiaWF0IjoxNzQ4NzA4NTExLCJleHAiOjE3NDg3OTQ5MTF9.sTqSGIYJwYfsYGikxuc1vHkkN9JJaUTnFxAcsISJ0lg'}"

  // 6.3 (first get the token via middleware) now set the token in a variable
  const token = req?.cookies?.token;
  console.log("cookie in the middleware by directly get the token", token);

  // 7.0 before this token verification we have to verify that the token is exist or not
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  // 7.1 if the token exist now verifying the token according to the documentation 'https://github.com/auth0/node-jsonwebtoken'
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // 7.2
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    // 7.3
    req.decoded = decoded;
    console.log(req.decoded.email); //in server terminal "ashahab007@gmail.com"
    next();
  });

  // 6.1 call the  next() initially but its commented because we will call next when if 7.2 is false
  // next();
};

// user name: 'career_db_admin and in password use auto generated password which is "O4t3tOchGoC21XpN". Then Built-in Role will be admin then add user.

// as we have to hide the user name and password so create .env file then type DB_USER=career_db_admin and DB_PASS=O4t3tOchGoC21XpN

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bmunlsr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Get the database and collection on which to run the operation
    const jobsCollections = client.db("carrerCode").collection("jobs");

    const applicationsCollections = client
      .db("carrerCode")
      .collection("applications");

    // 4.3 create the jwt token api. As we get the  data from the client side we use post method and receive the email im userData
    app.post("/jwt", async (req, res) => {
      const userData = req.body;
      // const user = { email };

      // 4.4 creating the token as per documentation from github and in secret we use environment variable to generate random token. steps are following for generate random token
      /**
       * in terminal type node
       * then type require('crypto').randomBytes(64)
       * then convert to string "require('crypto').randomBytes(64).toString('hex')"
       * then copy the generated token and save to .env file as JWT_SECRET=55c7203f06a5b582b61d255d80bbc123abc9079e64847660533233b525561bb2a06228c131d441ebf3492ba0c99c1fb087f21c98a73a2b98c6c30d0d4fc9d2d1
       * then set as process.env.JWT_SECRET
       */
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // 4.8 set token in the cookies then go to browser console => application => Cookies => u will find the token
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
      });
      // 4.5 sending a message to see the message in browser console
      res.send({ success: true });
    });

    app.get("/jobs", async (req, res) => {
      const email = req.query.email;

      const query = {};

      if (email) {
        query.hremail = email;
      }

      const cursor = await jobsCollections.find(query).toArray();

      // const cursor = await jobsCollections.find().toArray();
      res.send(cursor);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollections.findOne(query);
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobsCollections.insertOne(newJob);
      res.send(result);
    });

    // 5.1 now set the logger middleware between "/applications" and async (req, res) .... and reload the myapplication page u will see in server terminal "inside the logger middleware" i.e hits the logger middleware. but u have to comment the 4.9 console, to see the message otherwise it will show the token.
    // 6.4 set the verifyToken middleware between "/applications" and async (req, res) .... and reload the myapplication page.
    app.get("/applications", logger, verifyToken, async (req, res) => {
      const email = req.query.email;

      // 7.4 verify the email that is get from the token req.decoded.email with the query email
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "forbidden access" });
      }

      // 4.9 as the token is send to specific email so we are going to check that the specific email is getting the cookies or not in server terminal. But we didn't get the cookies because we didn't use cookie-parser in middleware that we have already import.
      // console.log("Inside application api", req.cookies);

      const query = { applicant: email }; //as we send the applicant data in applicant key from the form to db. so we will query by applicant: email

      const result = await applicationsCollections.find(query).toArray();

      for (const application of result) {
        const jobId = application.jobId; //set the job id for query
        const jobQuery = { _id: new ObjectId(jobId) };
        const job = await jobsCollections.findOne(jobQuery);
        application.title = job.title;
        application.company = job.company;
        application.company_logo = job.company_logo;
      }

      res.send(result); // from this step u can check in browser url using query string(?) "http://localhost:3000/applications?email=job@cob.com" or "http://localhost:3000/applications?email=ashahab007@gmail.com"
      // Note: if u need multiple query use (&) example "http://localhost:3000/applications?email=ashahab007@gmail.com&age=29"
    });

    app.get("/applications/job/:job_id", async (req, res) => {
      const job_id = req.params.job_id;

      const query = { jobId: job_id }; //this jobId is created when user applied for the jobs we send specific job id to jobId key.

      const result = await applicationsCollections.find(query).toArray();
      res.send(result);
    });

    app.post("/applications", async (req, res) => {
      //the application data is come to the req.body
      const application = req.body;
      console.log(application);
      const result = await applicationsCollections.insertOne(application);
      res.send(result);
    });

    app.patch("/applications/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: req.body.status,
        },
      };
      const result = await applicationsCollections.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close(); // 16.2 it must be commented
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job server is running");
});

app.listen(port, () => {
  console.log(`Job server is running on port ${port}`);
  //now in server terminal type nodemon index.js also type in browser url http://loclhost:3000
});
