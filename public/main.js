const socket = io();


const adminUser = document.querySelector("#adminUser");
const incomingPeople = document.querySelector(".inbox__people");
const input = document.querySelector(".message_form__input");
const form = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

const adminBlockForm = document.querySelector(".block_Form");
const blockButton = document.querySelector(".blockButton")
const blockInput = document.querySelector(".blockInput")

let candidateName = "";
let admin = false;

const newUserConnectedInChat = (user) => {
  candidateName = user || `User${Math.floor(Math.random() * 1000000)}`;
  socket.emit("newUser", candidateName);
  console.log("candidate name-----" + candidateName);
  addNewUserToList(candidateName);
};

const addNewUserToList = (candidateName) => {
  if (!!document.querySelector(`.${candidateName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${candidateName}-userlist">
      <h5>${candidateName}</h5>
    </div>
  `;
  incomingPeople.innerHTML += userBox;
};

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const styledTime = time.toLocaleString("en-IN", { hour: "numeric", minute: "numeric" });

  const receivedMsgElement = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${styledTime}</span>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${styledTime}</span>
      </div>
    </div>
  </div>`;

  messageBox.innerHTML += user === candidateName ? myMsg : receivedMsgElement;
};


// new user is created so we generate nickname and emit event
newUserConnectedInChat();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!input.value) {
    return;
  }
  socket.emit("message", {
    message: input.value,
    nick: candidateName,
  });
  input.value = "";
});

function blockUser() {
  if (!blockInput.value) {
    return;
  }
  console.log("blocking user-----------");
  socket.emit("blockthisuser", blockInput.value)
  console.log("block this user " + blockInput.value);
  blockInput.value = "";
}

socket.on("userBlocked", (user) => {
  user.forEach(element => {
    if (element == candidateName) {
      input.disabled = true;
    }
    document.querySelector("#blockdiv").innerHTML +=
      `<p>${element} was blocked by admin </p>`
  });
})

socket.on("admin", (data) => {
  console.log("admin------------" + data);
  adminUser.innerHTML = "ADMIN IS " + `${data}`;
  if (candidateName === data) {
    document.getElementById("blockUser").style.display = "block";
  }
})


socket.on("newUser", (data) => {
  data.map((user) => addNewUserToList(user));
});


socket.on("disconnected", (candidateName) => {
  document.querySelector(`.${candidateName}-userlist`).remove();

});


socket.on("message", (data) => {
  addNewMessage({ user: data.nick, message: data.message });
});
