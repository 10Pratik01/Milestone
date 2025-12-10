import express from "express"; 
import dotenv from 'dotenv'
import bodyParser from "body-parser";
import cors from 'cors'; 
import helmet from "helmet";
import morgan from "morgan";

// routes import
import projectRoutes from './routes/projectRoutes.js'


// Route import 


//Configuration 
dotenv.config(); 
const app = express(); 
app.use(express.json()); 
app.use(helmet()); 
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"})); 
app.use(morgan("common")); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: false})); 
app.use(cors()); 

// Home route 
app.get('/', (req, res) => {
    res.send("SERVER IS RUNNING "); 
})

// Routes
app.use("/projects", projectRoutes); 
 
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`APP IS LISTNING AT ${port}`); 
})