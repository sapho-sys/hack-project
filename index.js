import express from "express";
const app = express();
import exphbs from "express-handlebars";
import session from "express-session";
import bodyParser from "body-parser";
import carRouters from "./routes/route.js";
import flash from "express-flash";
import dataFactory from "./services/data-factory.js";
// import displayFactory from "./display-factory.js";
import pgPromise from "pg-promise";

const pgp = pgPromise({});

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:nku05089@localhost:5432/parkingslots';




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
// const myRegies = displayFactory();
// regiesDB.resetData();

let employeeRouter = carRouters(regiesDB,db);

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
app.get('/', employeeRouter.defaultRoute);
app.post('/driver', employeeRouter.postDriver)
app.get('/drivers/:username', employeeRouter.getDriver)
app.post('/slot', employeeRouter.postSlot);
app.get('/admin', employeeRouter.getSlot);
app.get('/drivers', employeeRouter.getUI);
app.post('/waitername',employeeRouter.deleteUser);


//start the server
const PORT = process.env.PORT || 3012;

app.listen(PORT, function () {
    console.log("App running at http://localhost:" + PORT)
});

