const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");
const activeUser = document.querySelector("#activeUsers");


let userName = "";
var userCount = 0;

const newUserConnected = (user) => {
	userName = user || `User${Math.floor(Math.random() * 1000000)}`;
	socket.emit("new user", userName);
};

const addToUsersBox = (userName) => {
	if (!!document.querySelector(`.${userName}-userlist`)) {
		return;
	}

	const userBox = `
	<div class="chat_ib ${userName}-userlist">
	  <h5>${userName}</h5>
	</div>
  `;
	inboxPeople.innerHTML += userBox;
};

const addNewMessage = ({ user, message }) => {
	const time = new Date();
	const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

	const receivedMsg = `
  <div class="incoming__message">
	<div class="received__message">
	  ${user}: ${message}
	</div>
  </div>`;

	const myMsg = `
  <div class="outgoing__message">
	<div class="sent__message">
	  You: ${message}
	</div>
  </div>`;

	messageBox.innerHTML += ((user === userName) ? myMsg : receivedMsg);
	messageBox.scrollTop = messageBox.scrollHeight;
};

// new user is created so we generate nickname and emit event
newUserConnected();

messageForm.addEventListener("submit", (e) => {
	e.preventDefault();
	if (!inputField.value) {
		return;
	}

	socket.emit("chat message", {
		message: inputField.value,
		nick: userName,
	});

	inputField.value = "";
});

inputField.addEventListener("keyup", () => {
	socket.emit("typing", {
		isTyping: inputField.value.length > 0,
		nick: userName,
	});
});

socket.on("new user", function (data) {
	//data.map((user) => addToUsersBox(user));
	activeUser.innerHTML = `${data.length}`	
});

socket.on("user disconnected", function (userName) {
	document.querySelector(`.${userName}-userlist`).remove();
});

socket.on("chat message", function (data) {
	addNewMessage({ user: data.nick, message: data.message });
});


socket.on("typing", function (data) {
	const { isTyping, nick } = data;

	if (!isTyping) {
		fallback.innerHTML = "";
		return;
	}

	fallback.innerHTML = `<p>${nick} is typing...</p>`;
});
