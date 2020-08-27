// JS file for front_end of finger_with_tissue.html
// BY JUNHO CHOI


function scaleToFit(image){
  // get the scale
  var scale = Math.min(c.width / image.width, c.height / image.height);
  // get the top left position of the image
  var x = (c.width / 2) - (image.width / 2) * scale;
  var y = (c.height / 2) - (image.height / 2) * scale;
  ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
}


function draw_img(url) {
  //console.log("Drawing");
  var image = new Image();
  image.onload = function() {
    ctx.clearRect(0,0,c.width, c.height);
    scaleToFit(image);
    //console.log("Image is loaded");
  };
  image.src = url;
}

var introvideo = document.getElementById('watchMe');
var overlay = document.getElementById('overlay');

var start = false; // evaluate when video has ended
introvideo.addEventListener('timeupdate', function(){
  if (introvideo.currentTime == introvideo.duration) {
    introvideo.style.display = 'none';
    overlay.style.display = 'none';
    start = true;
    console.log(start);
  }
}, false);

// On toggle button clicks
function toggleView(id) {
  let ViewOff = document.getElementById(id + 'View');
  if (document.getElementById(id).checked == true) {
    ViewOff.style.display = 'block';
  } else {
    ViewOff.style.display = 'none';
  };
}


var colours = ['#FFFFFF','#65B1FC', '#FFFBDB','#FFEC51']
document.getElementById('img_container').style.backgroundColor = colours[0];
var sfx = new Audio('sound/tissue_sf.m4a');
var c;
var ctx;
var tissue_img_array = ['img/no_hand.jpeg', 'img/hand_down.jpeg', 'img/hand_grab.jpeg', 'img/hand_up.jpeg'];
window.onload = () => {
  sfx.load();

  var thediv = document.getElementById("img_container");
  c = document.getElementById("img_canvas");
  ctx = c.getContext('2d');

  function resize(){
    c.width = thediv.clientWidth;
    c.height= thediv.clientHeight;
  }
  //on page resize, call resize()
  window.addEventListener("resize", resize, false);

  //call resize() initially to set the canvas size correctly
  resize();

  console.log("Window loaded");
  draw_img(tissue_img_array[0]);    // draw initial image

  var down = true;    //bool for checking whether motion downwards or up
  // don't run redrawing until model is set up
  //setTimeout(function() {
    setInterval(function(){
      if (start == true) {
        var last_el = trainingData[trainingData.length-1];
        //find grad
        var grad = (last_el["palm"][1]-last_el["middle1"][1])/(last_el["middle1"][0]-last_el["palm"][0])
        console.log(grad);

        //Only for RIGHT HAND
        if (grad<=2.5 && grad>=0) {   //Condition for movement in between
          if (down == true) {     //checking if motion is downwards or not
            document.getElementById('img_container').style.backgroundColor = colours[2];
            draw_img(tissue_img_array[1])
          }
          else {
            document.getElementById('img_container').style.backgroundColor = colours[3];
            sfx.play();
            draw_img(tissue_img_array[3]);
          }
        }
        else if (grad>2.5 || grad<-1.0) {   // condition for when at top
          document.getElementById('img_container').style.backgroundColor = colours[0];
          draw_img(tissue_img_array[0])
          down = true;
        }
        else if (grad<0) {    // condition for when at bottom
          document.getElementById('img_container').style.backgroundColor = colours[1];
          draw_img(tissue_img_array[2]);
          down = false;
        }
      }
    }, 1000);
  //}, 5000)
}
