// JS file for front_end of hand_crush.html
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

document.getElementById('img_container').style.backgroundColor = '#3DA5D9';

var sfx = new Audio('sound/papercrumple.m4a');
var end_sound = new Audio('sound/ding.m4a');

var introvideo = document.getElementById('watchMe');
var overlay = document.getElementById('overlay');

var start = false;// evaluate when video has ended
introvideo.addEventListener('timeupdate', function(){
  if (introvideo.currentTime == introvideo.duration) {
    introvideo.style.display = 'none';
    overlay.style.display = 'none';
    start = true;
    console.log(start);
  }
}, false);

var c;
var ctx;
var paper_img_array = ['img/paper.png', 'img/paperball.png'];
window.onload = () => {
  sfx.load();
  end_sound.load();

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
  draw_img(paper_img_array[0]);    // draw initial image

  var count = 0; //count
  var thumb_on_left = true;//bool for checking whether motion left or right
  var calib = false;
  var fist = true;
  // don't run redrawing until model is set up
  //setTimeout(function() {
    var repeat = setInterval(function(){
      if (start == true) {
        var last_el = trainingData[trainingData.length-1];

        //Only for RIGHT HAND
        var dx = (last_el["thumb4"][0]-last_el["pinky4"][0])
        var dy = (last_el["thumb4"][1]-last_el["pinky4"][1])
        var dist = Math.sqrt((dx*dx) + (dy*dy));
        // set level as 300px
        console.log(dist);

        if (count == 5) {
          end_sound.play();
          document.getElementById('img_container').style.background = '#FFEC69';
          document.getElementById('popup_box').style.display = 'block';
          //alert("Exercise completed");
          clearInterval(repeat);
        }
        else if (dist >=300 && fist == true) {
          calib = true;
          fist = false;
          document.getElementById('notclose').style.display = 'none';
          draw_img(paper_img_array[0]);
        }
        else if (dist>=80 && dist<=120 && calib == true && fist == false) {
          fist = true;
          sfx.play();
          draw_img(paper_img_array[1]);
          count++;
        }
        /*else {
          document.getElementById('notclose').style.display = 'block';
        }*/
      }
    }, 250);
  //}, 5000)
}
