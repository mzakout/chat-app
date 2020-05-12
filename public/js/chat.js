
$(function () {
    function element(id) {
        return document.getElementById(id);
    }

    function showNotification(from, mAlign, message, mType) {
        $.notify({
            icon: "add_alert",
            message: message

        }, {
            type: mType,
            timer: 1000,
            placement: {
                from: from,
                align: mAlign
            }
        });
    }

    //make connection
    var socket = io.connect('http://localhost:3000')

    //buttons and inputs
    var message = $("#inputMessage")
    var username = $("#new_username")
    var btn_save = $("#send_username")
    var online_users = $("#online_users")
    const messageInput = element("inputMessage");
    const sendMessageBtn = element("send_message");
    const messages_box = element("messages_box");

    //Listen on connected users
    socket.on('new_user', (data) => {

        var new_user_template = `<li class="nav-item" id="${data.id}"><a class="nav-link"><i class="material-icons">person</i> <p id="${data.id}_u"> ${data.username}</p> <small id="${data.id}_t"></small></a></li>`;

        online_users.append(new_user_template)
    })


    //Listen on new_message
    socket.on("new_message", (data) => {
        createMessageElement(data)
    })

    //Emit a username
    btn_save.click((event) => {
        if (username.val())
            socket.emit('change_username', { username: username.val() })
        event.preventDefault()
    })

    //Emit message
    sendMessageBtn.addEventListener('click', (event) => {
        if (message.val()) {
            socket.emit('new_message', { message: message.val() })
            message.val('')
        }
        event.preventDefault()
    })

    socket.on('change_username', (data) => {
        var username_id = data.id + "_u"
        var name = document.getElementById(username_id)
        name.innerText = data.username
        showNotification('bottom', 'right', `${data.old_name} canged his username to ${data.username}`, 'warning')
    })


    //Listen on typing
    socket.on('notifyTyping', (data) => {
        const isTyping = element(data.id + "_t")
        isTyping.innerText = ''
        isTyping.innerText = 'is typing...'
    })
    //Listen on stoped typing
    socket.on('notifyStopTyping', (data) => {
        const isTyping = element(data.id + "_t")
        isTyping.innerText = ''
    })

    //when user leaves the chart remove from online list
    socket.on('userLeft', (data) => {
        var leftUser = element(data.id);
        showNotification('bottom', 'right', `${data.username} Left the chat room`, 'danger')
        leftUser.remove();
    })

    messageInput.addEventListener('keydown', (e) => { socket.emit('typing') });
    messageInput.addEventListener('keyup', (e) => {
        if (event.keyCode === 13) {
            sendMessageBtn.click();
            event.preventDefault();
        }
        event.preventDefault();
        socket.emit('stopTyping')
    });

    function createMessageElement(data) {
        var content = data.message;
        var user = data.username;
        var time = data.timestamp;
        console.log("appending message");

        let temp = `<a class="list-group-item list-group-item-action list-group-item-light rounded-0"><div class="media-body ml-4"><div class="d-flex align-items-center justify-content-between mb-1"> <h6 class="mb-0">${user}</h6><small class="small font-weight-bold">${time}</small></div> <p class="font-italic text-muted mb-0 text-small">${content}</p></div></a>`

        $(temp).appendTo(messages_box);
        start_scroll_down()
    }

    function start_scroll_down() {
        const something = element("messages_box")
        scroll = setInterval(() => {
            something.scrollBy(0, 1);
        }, 1);
    }

});

