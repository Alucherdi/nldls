var express = require("express")
var app = express()

var bp = require("body-parser")

var session = require("express-session")

var port = process.env.PORT || 4200

var mysql = require("mysql")

var connection

function handleDisconnect () {
	connection = mysql.createConnection({
		host: "50.62.209.199",
		user: "cesarPromo",
		password: "litrossuerte1994",
		database: "Litros_suerte2"
	})

	connection.connect(function (err) {
		if (err) {
			console.log("Connection error: " + err)
			setTimeOut(handleDisconnect, 2000)
		}
	})

	connection.on("error", function (err) {
		console.log("dberror: " + err)
		if (err.code === "PROTOCOL_CONNECTION_LOST") {
			handleDisconnect()
		} else {
			throw err
		}
	})
}

handleDisconnect()

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

app.use((req, res, next) => {
	res.locals.user = req.session.user
	next()
})

app.get("/", (req, res) => {
	res.render("home")
})

app.get("/secret", (req, res) => {
	req.session.test = "Secret visited"
	console.log(req.session.test)
	res.send("Got the secret level boy ;). <br>Some hidden shit is over here")
})

app.get("/ingresa", (req, res) => {
	if (req.session.user != undefined) {
		res.redirect("/ticket")
	} else {
		var registered = req.query.success
		res.render("login",{ registered: registered })
	}	
})

app.get("/mistickets", (req, res)  => {
	if (req.session.user == undefined) {
		res.redirect("/ingresa")
	} else {
		var query = "SELECT * FROM tickets WHERE usuario = " 
			+ req.session.user.id
		
		connection.query(query, (err, result, f) => {
			if (err) {
				throw err
			}
			
			res.render("mytickets", { tickets: result })
		})
	}
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
			res.redirect("/ticket?login=true")
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
	res.redirect("/ingresa?success=true")
	
})

app.get("/ticket", (req, res) => {
	if (req.session.user == undefined) {
		res.redirect("/ingresa")
	} else {
		console.log(req.session.user.usuario)
		var added = req.query.success
		var repeated = req.query.repeated
		var error = req.query.error
		res.render("ticket", { added : added, repeated: repeated , error: error})
	}
})

app.post("/addTicket", (req, res) => {
	if (req.session.user == undefined) {
		res.redirect("/ingresa")
	} else {
		var query = "SELECT * FROM tickets WHERE folio = '" + req.body.folio + "'"
		var msg = ""
		connection.query(query, (err, result, f) => {
			if (err) {
				console.log(err)
				res.redirect("/ticket?error=true")
			}
			if (result[0] == undefined) {
				res.redirect("/ticket?error=true")
			}
			else {
				if (result[0].usado == 1) {
					res.redirect("/ticket?repeated=true")
				} else if (result[0].usado == 0) {
					query = "UPDATE tickets SET usado = 1, usuario = '" + req.session.user.id + "' WHERE folio = '" + req.body.folio + "'"
					connection.query(query, (err2, result2, f) => {
						if (err2) {
							throw err2
						}
						console.log("Ticket modificado")
						res.redirect("/ticket?success=true")
					})
					
				}
			}
		})
	}
})

app.get("/ranking", (req, res) => {
	var query = "SELECT usuarios.nombre, COUNT(tickets.usuario) AS tickets FROM usuarios,tickets WHERE tickets.usuario != 0 AND tickets.usuario = usuarios.id GROUP BY tickets.usuario ORDER BY count(*) DESC"
	connection.query(query, (err, result, f) => {
		if (err) {
			throw err
		}
		
		res.render("ranking", { tickets: result })
	})
})
app.get("/ganadores", (req, res) => {
	var query = "SELECT posicion,nombre,apellidos,tickets FROM ganadores ORDER BY posicion ASC" 
	connection.query(query, (err, result, f) => {
		if (err) {
			throw err
		}
		
		res.render("ganadores", { tickets: result })
	})
})

app.get("/logout", (req, res) => {
	req.session.user = null
	res.redirect("/")
})

app.listen(port, () => {
	console.log("Listening to: " + port)
})