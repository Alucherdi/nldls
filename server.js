var express = require("express")
var app = express()

var bp = require("body-parser")

var port = process.env.PORT || 4200

var mysql = require("mysql")
var connection = mysql.createConnection({
	host: "50.62.209.199",
	user: "alucherdi",
	password: "mundoweb666",
	database: "Litros_de_la_suerte"
})

/*
connection.connect()
connection.query("SELECT * FROM tickets WHERE id = 1", (err, res, fields) => {
	if (err) throw err
	console.log("Res: " + res[0].folio)
})
*/
var hbs = require("express-handlebars")

app.engine("hbs", hbs({defaultLayout: "main", extname: "hbs"}))
app.set("view engine", "hbs")
app.use(express.static("public"))
app.use(bp.json())
app.use(bp.urlencoded({ extended: true}))

app.get("/", (req, res) => {
	res.render("home")
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
		console.log(result[0])
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

app.listen(port, () => {
	console.log("Listening to: " + port)
})