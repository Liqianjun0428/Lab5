// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

var canvas = document.getElementById('user-image');
var ctx = canvas.getContext('2d');
ctx.font = 'normal bold 20px sans-serif';
ctx.font = "30px Arial";
ctx.textAlign = "center";
var speeker = window.speechSynthesis;
var images = document.images;
var volume = document.querySelector("[type='range']");

var topText;
var bottomText;
// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  
  // TODO
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // - Clear the form when a new image is selected
  document.getElementById('text-top').value = null;
  document.getElementById('text-bottom').value = null;
  var buttons = document.getElementById('button-group').getElementsByTagName('*');
  for(var button of buttons){
    button.disabled = true;
  }
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
  var scale = getDimmensions(canvas.width, canvas.height,img.width,img.height);
  ctx.drawImage(img,scale.startX,scale.startY,scale.width,scale.height);
});

// handle image input
var input = document.getElementById('image-input');
input.addEventListener('change', handleFiles, false);

function handleFiles(e) {
  var url = URL.createObjectURL(e.target.files[0]);
  img.src = url;
  var filename = input.value.split(/(\\|\/)/g).pop();
  img.alt = filename;
}

document.getElementById('text-top').oninput = function(e){
  topText = this.value;
}

document.getElementById('text-bottom').oninput = function(e){
  bottomText = this.value;
}
// handle submit
document.querySelector("[type='submit']").addEventListener('click',() => {
  event.preventDefault();
  ctx.fillStyle = "white";
  ctx.fillText(topText,canvas.width/2,40);
  ctx.fillStyle = "white";
  ctx.fillText(bottomText,canvas.width/2,canvas.height-40);
  var buttons = document.getElementById('button-group').getElementsByTagName('*');
  for(var button of buttons){
    button.disabled = false;
  }
  document.getElementById('voice-selection').disabled = false;
});

// handle clear
document.querySelector("[type='reset']").addEventListener('click',() => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  var buttons = document.getElementById('button-group').getElementsByTagName('*');
  for(var button of buttons){
    button.disabled = true;
  }
  document.getElementById('text-top').value = null;
  document.getElementById('text-bottom').value = null;
  document.getElementById('image-input').value = null;
  document.getElementById('voice-selection').disabled = true;
});

// handle voice language drop down box
function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  var voices = speechSynthesis.getVoices();

  for(var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    document.getElementById("voice-selection").appendChild(option);
  }
}

populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// handle readText
document.querySelector("[type='button']").addEventListener("click",()=>{
  var inputTxt1 = document.getElementById('text-top').value;
  var inputTxt2 = document.getElementById('text-bottom').value;
  var selected = document.getElementById("voice-selection");
  var language = selected.options[selected.selectedIndex].getAttribute('data-lang');
  var utterThis1 = new SpeechSynthesisUtterance(inputTxt1);
  var utterThis2 = new SpeechSynthesisUtterance(inputTxt2);
  utterThis1.lang = language;
  utterThis2.lang = language;
  var volume = document.querySelector("[type='range']");
  utterThis1.volume = volume.value/100;
  utterThis2.volume = volume.value/100;
  speeker.speak(utterThis1);
  speeker.speak(utterThis2);
});

volume.addEventListener('input',()=>{
  var volumeNum = volume.value;
  if(volumeNum < 1){
    images[0].src = "icons/volume-level-0.svg";
    images[0].alt = "Volume Level 0";
  }else if(volumeNum>=1 && volumeNum<=33){
    images[0].src = "icons/volume-level-1.svg";
    images[0].alt = "Volume Level 1";
  }else if(volumeNum>33 && volumeNum<=66){
    images[0].src = "icons/volume-level-2.svg";
    images[0].alt = "Volume Level 2";
  }else{
    images[0].src = "icons/volume-level-3.svg";
    images[0].alt = "Volume Level 3";
  }
});
/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
