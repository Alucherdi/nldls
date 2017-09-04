var body = document.getElementsByTagName("body")[0]
body.innerHTML += "<div id='toastManager'></div>"

var toast = function (msg) {
	var toastDiv = document.getElementById("toastManager")
	toastDiv.style.opacity = 1
	toastDiv.style.top = "0px";
	toastDiv.innerHTML = msg
	setTimeout(function () {
		toastDiv.style.opacity = 0
		toastDiv.style.top = "-100px"
	}, 2500)
}