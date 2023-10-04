document.addEventListener("dblclick", function () {
  document.documentElement.requestFullscreen();
});
const textbox = document.getElementById("msg-box");
const sendbutton = document.getElementById("btn-send");
const discussionBox = document.getElementById("discussion");
const chooseFiles = document.getElementById("chFiles");
const chooseButton = document.getElementById("chBtn");
const socket = io();
let imagesAllChunk = [];
let bubbles = null;

socket.on("chat message", (data) => {
  if (socket.id != data.id) {
    discussionBox.innerHTML += `
  <div class="bubble sender hue">${data.msg}</div>
`;
    scrollToBottom();
    bubbles = Array.from(document.querySelectorAll(".bubble"));
  }
});

socket.on("image send", (data) => {
  if (socket.id != data.id) {
    const chunk = data.url;
    imagesAllChunk.push(chunk);
    // Simulating upload of chunk (replace with your actual upload logic)
    // console.log("Uploaded chunk:", chunk);
    if (imagesAllChunk.length == data.leng) {
      const blob = new Blob(imagesAllChunk);
      const imageUrl = URL.createObjectURL(blob);
      if (data.type == "image") {
        discussionBox.innerHTML += `
      <div class="bubble sender">
        <img src="${imageUrl}">
      </div>
      `;
      } else if (data.type == "audio") {
        discussionBox.innerHTML += `
      <div class="bubble sender" style="max-width: fit-content;">
        <audio src="${imageUrl}" controls></audio>
      </div>
      `;
      } else if (data.type == "video") {
        discussionBox.innerHTML += `
      <div class="bubble sender" style="max-width: fit-content;">
        <video controls>
          <source src="${imageUrl}"></source>  
        </audio>
      </div>
      `;
      }
      imagesAllChunk = [];
    }
    scrollToBottom();
    bubbles = Array.from(document.querySelectorAll(".bubble"));
  }
});

sendbutton.addEventListener("click", function () {
  if (textbox.value == "") return;
  discussionBox.innerHTML += `
<div class="bubble recipient">${textbox.value}</div>
`;
  socket.emit("chat message", textbox.value);
  scrollToBottom();
  bubbles = Array.from(document.querySelectorAll(".bubble"));
  textbox.value = "";
});

chooseButton.addEventListener("click", () => {
  chooseFiles.click();
});
chooseFiles.addEventListener("change", function (e) {
  const files = e.target.files[0];
  if (typeOfFile(files) == "nah") return;
  if (typeOfFile(files) == "image") {
    discussionBox.innerHTML += `
      <div class="bubble recipient">
        <img src="${URL.createObjectURL(files)}">
      </div>
      `;
  } else if (typeOfFile(files) == "audio") {
    discussionBox.innerHTML += `
      <div class="bubble recipient" style="max-width: fit-content;">
        <audio src="${URL.createObjectURL(files)}" controls></audio>
      </div>
      `;
  } else if (typeOfFile(files) == "video") {
    discussionBox.innerHTML += `
      <div class="bubble recipient" style="max-width: fit-content;">
        <video controls>
          <source src="${URL.createObjectURL(files)}"></source>  
        </audio>
      </div>
      `;
  }
  scrollToBottom();
  bubbles = Array.from(document.querySelectorAll(".bubble"));
  const reader = new FileReader();
  reader.onload = function () {
    const buffer = new Uint8Array(reader.result);
    const chunkSize = 1024; // Increase chunk size to reduce the number of chunks
    let offset = 0;
    let totalChunks = Math.ceil(buffer.length / chunkSize);

    while (offset < buffer.length) {
      const chunk = buffer.slice(offset, offset + chunkSize);
      socket.emit("image send", {
        url: chunk,
        type: typeOfFile(files),
        leng: totalChunks,
      });
      offset += chunkSize;
    }
  };

  reader.readAsArrayBuffer(files);
});

discussionBox.addEventListener("scroll", (e) => {
  var scrollY = discussionBox.scrollTop;
  // Calculate the percentage of scroll progress
  var scrollPercentage = (scrollY / discussionBox.scrollHeight) * 100;

  // Convert the scroll percentage to degrees
  var degrees = (scrollPercentage / 100) * 360;

  // Ensure the degrees value is within the range of 0 to 360
  degrees = degrees % 360;

  bubbles.forEach((bubble) => {
    if (bubble.classList.contains("hue")) {
      bubble.style.filter = `hue-rotate(${degrees}deg)`;
    }
  });
});

function scrollToBottom() {
  discussionBox.scrollTop = discussionBox.scrollHeight;
}

function typeOfFile(file) {
  if (file.type.startsWith("image/")) {
    return "image";
    // Handle image file
  } else if (file.type.startsWith("audio/")) {
    return "audio";
    // Handle audio file
  } else if (file.type.startsWith("video/")) {
    return "video";
    // Handle video file
  } else {
    alert("Selected file is not an image, audio, or video");
    return "nah";
  }
}
