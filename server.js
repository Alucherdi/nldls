var express = require("express")
var app = express()

var bp = require("body-parser")

var session = require("express-session")

var port = process.env.PORT || 4200

var mysql = require("mysql")
var connection = mysql.createConnection({
	host: "50.62.209.199",
	user: "alucherdi",
	password: "mundoweb666",
	database: "Litros_de_la_suerte"
})

var hbs = require("express-handlebars")

app.engine("hbs", hbs({defaultLayout: "main", extname: "hbs"}))
app.set("view engine", "hbs")

app.use(session({
	name: "ldls-session",
	secret: "321654",
	resave: true, 
	saveUninitialized: true
}))

app.use(express.static("public"))

app.use(bp.json())
app.use(bp.urlencoded({ extended: true}))

app.get("/", (req, res) => {
	console.log(req.session.test)
	res.render("home")
})

app.get("/secret", (req, res) => {
	req.session.test = "Secret visited"
	console.log(req.session.test)
	res.send("Got the secret level boy ;). <br>Some hidden shit is over here")
})

app.get("/ingresa", (req, res) => {
	res.render("login")
})

app.post("/ingresa", (req, res) => {
	var query = "SELECT * FROM usuarios WHERE usuario = " 
	+ "'" + req.body.usuario + "' AND password = "
	+ "'" + req.body.password + "'"

	connection.query(query, (err, result, f) => {
		if (err) {
			throw err
		}
		var user = result[0]
		if (user == undefined) {
			res.redirect("/ingresa?login=false")
		} else {
			req.session.user = user
			res.redirect("/ticket")
		}
	})
})

app.get("/registro", (req, res) => {
	res.render("signup")
})

app.post("/registro", (req, res) => {
	
	var query = "INSERT INTO usuarios(nombre, apellidos, usuario, password, correo, telefono) VALUES ('" + req.body.nombre + "', "
	+ "'" + req.body.apellidos + "', "
	+ "'" + req.body.usuario + "', "
	+ "'" + req.body.password + "', "
	+ "'" + req.body.correo + "', "
	+ "'" + req.body.telefono + "')"
	connection.query(query, (err, result, f) => {
		if (err) {
			throw err
		}
		console.log(result)
	})
	res.redirect("/ingresa")
	
})

app.get("/ticket", (req, res) => {
	res.render("ticket")
})

app.post("/addTicket", (req, res) => {
	var query = "SELECT * FROM tickets WHERE folio = '" + req.body.folio + "'"
	var msg = ""
	connection.query(query, (err, result, f) => {
		if (err) {
			throw err
		}
		if (result[0].usado == 1) {
			msg = "Ticket ya registrado"
		} else if (result[0].usado == 0) {
			query = "UPDATE tickets SET usado = 1, usuario = '" + req.session.user.id + "' WHERE folio = '" + req.body.folio + "'"
			console.log("Ticket modificado")
			res.redirect("/ticket")
		}
	}) 
})

app.listen(port, () => {
	console.log("Listening to: " + port)
})