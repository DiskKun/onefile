const express = require('express');
const app = express();
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const fsExtra = require('fs-extra')
const socket = require("socket.io");

// handle static files like stylesheets and images
app.use(express.static('public'));
app.use(fileUpload());

// Set up root path, sending index.html
app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/public/index.html'));
})

app.get('/view', function (req, res) {
	let filename = fs.readdirSync(`${__dirname}/public/oneFileFile`)[0] 
  	res.send(filename);
		
})

app.post('/upload', function(req, res) {
	let uploadedFile;
	let uploadPath;

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).send('No files were uploaded.');
	}
	fsExtra.emptyDirSync(__dirname + "/public/oneFileFile")

	console.log(req.files.file); // the uploaded file object
	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	uploadedFile = req.files.file;
	let a = uploadedFile.name.split('.')
	uploadPath = __dirname + '/public/oneFileFile/oneFileFile.' + a[a.length-1] ;
	fs.appendFileSync(__dirname + "/public/uploadlog.txt", "Somebody uploaded a " + a[a.length-1] + " file!\n")
	// Use the mv() method to place the file somewhere on your server
	uploadedFile.mv(uploadPath, function(err) {
		if (err)
			return res.status(500).send(err);

		res.redirect('/main.html');
	//	res.send('file uploaded!')
	});	
});

// Launch Server
const server = app.listen(3000, function () {
	console.log('OneFile listening on port 3000!')
});

// Static files
app.use(express.static("public"));

const io = socket(server);
const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });
});
