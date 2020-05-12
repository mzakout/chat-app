const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

//set the template engine ejs
app.set('view engine', 'ejs')

//middlewares
app.use(express.static('public'))


//Listen on port 3000
server = app.listen(port, () => {
    console.log('server started at http://localhost:' + port);
})

//socket.io instantiation
const io = require("socket.io")(server)

var online_users = [];
app.get('/', function (req, res) {
    res.render('index', { arr: online_users });
});

//listen on every connection
io.on('connection', (socket) => {
    console.log('New user connected : ' + socket.id)
    //default username
    socket.username = "Anonymous";
    online_users.push({ username: socket.username, id: socket.id })
    io.sockets.emit('new_user', { username: socket.username, id: socket.id })

    //listen on change_username
    socket.on('change_username', (data) => {
        var oldName = socket.username;
        socket.username = data.username
        io.sockets.emit('change_username', { id: socket.id, username: socket.username, old_name: oldName })
        change_username(socket.id, data.username)
    })

    //Someone is typing
    socket.on("typing", () => {
        socket.broadcast.emit("notifyTyping", { id: socket.id });
    });

    //when soemone stops typing
    socket.on("stopTyping", () => {
        socket.broadcast.emit("notifyStopTyping", { id: socket.id });
    });

    //when user leave the chat
    socket.on("disconnect", () => {
        online_users = arrayRemove(online_users, socket.id)
        io.sockets.emit("userLeft", { id: socket.id, username: socket.username });
    });


    //listen on new_message
    socket.on('new_message', (data) => {
        const time = Date.now();
        //broadcast the new message
        function convertDateToString() {
            var date = new Date(time);
            return date.toString();
        }
        io.sockets.emit('new_message', { message: data.message, username: socket.username, timestamp: convertDateToString() });
    })

    //listen on typingd
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { id: socket.id })
    })
})

function change_username(id, username) {
    var idx = online_users.findIndex((obj) => obj.id == id)
    online_users[idx].username = username;
}

function arrayRemove(arr, value) {
    console.log("removing id from list " + value);

    if (arr) {
        return arr.filter(function (ele) {
            return ele.id != value;
        });
    } else {
        console.log("the list is empty , nothing to remove");
        return [];
    }
}

