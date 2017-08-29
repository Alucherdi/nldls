var express = require("express")
var app = express()
var port = process.env.PORT || 4200

var hbs = require("express-handlebars")

app.engine("hbs", hbs({defaultLayout: "main", extname: "hbs"}))
app.set("view engine", "hbs")
app.use(express.static("public"))

app.get("/", (req, res) => {
	res.render("home")
})

app.get("/ingresa", (req, res) => {
	res.render("login")
})

app.get("/registro", (req, res) => {
	res.render("signup")
})

app.get("/ticket", (req, res) => {
	res.render("ticket")
})

app.listen(port, () => {
	console.log("Listening to: " + port)
})