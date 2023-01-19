import express from "express";
const app = express();
import session from "express-session";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import carsRouters from "./routes/route.js";
import flash from "express-flash";
import dataFactory from "./services/data-factory.js";
import pgPromise from "pg-promise";

//const pgp = pgPromise({});

//const connectionString = process.env.DATABASE_URL || 'postgresql://superuser:joshuabode@localhost:5432/hackdb';
import pkg from 'pg';
const { Client } = pkg;
//const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'joshuabode',
  
  database: 'hackdb'
});

client.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected to the database");
  }
});


/*const config = { 
	connectionString
}*/

if (process.env.NODE_ENV == 'production') {
	config.ssl = { 
		rejectUnauthorized : false
	}
}

//const db = pgp(config);
const regiesDB = dataFactory(client);

//let employeeRouter = carsRouters(regiesDB,db);
//let user = { name: "Joshua", surname: "Bode" , licence_plate: "CA11111" , parking_id: 1}

//regiesDB.addUser(user);
//regiesDB.createParking();
//regiesDB.populateParking();

console.log("test")
console.log(regiesDB.getAllParking())
regiesDB.updateParking(6, true, '01:00:00', 5);
//config express as middleware
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

//css public in use
app.use(express.static('public'));


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json());

// initialise session middleware - flash-express depends on it
app.use(session({
    secret: 'djfhsdflbasf',
    resave: false,
    saveUninitialized: true   
}));

// initialise the flash middleware
app.use(flash());

//ROUTES FOR INBOUND/OUTBOUND DATA
//app.get('/', employeeRouter.defaultRoute);
//app.post('/employee',employeeRouter.postDriver);
//app.get('/employee/:username', employeeRouter.getDriver);
//app.post('/slots', employeeRouter.postSlot);




//start the server
const PORT = process.env.PORT || 3012;

app.listen(PORT, function () {
    console.log("App running at http://localhost:" + PORT)
});