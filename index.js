import express from "express";
const app = express();
import session from "express-session";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import carsRouters from "./routes/route.js";
import flash from "express-flash";
import dataFactory from "./services/data-factory.js";
import pgPromise from "pg-promise";

const pgp = pgPromise({});

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:sap123@localhost:5432/her_waiters';

const config = { 
	connectionString
}

if (process.env.NODE_ENV == 'production') {
	config.ssl = { 
		rejectUnauthorized : false
	}
}

const db = pgp(config);
const regiesDB = dataFactory(db);

let employeeRouter = carsRouters(regiesDB,db);

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
app.get('/', employeeRouter.defaultRoute);
app.post('/employee',employeeRouter.postDriver);
app.get('/employee/:username', employeeRouter.getDriver);
app.post('/slots', employeeRouter.postSlot);




//start the server
const PORT = process.env.PORT || 3012;

app.listen(PORT, function () {
    console.log("App running at http://localhost:" + PORT)
});