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
// NEW CODE from here
var repeat;
var timer;
var end_ex = false;
var timer_start = false;
function endEx(txt,Count_el) {
  progress = 5 // out of 5 for five seconds
  Count_el.innerHTML = progress;
  timer_start = true;
  var t = new Date();
  t.setSeconds(t.getSeconds() + progress);
  timer = setInterval(function() {
    var delta = t - Date.now();
    progress--;
    Count_el.innerHTML = progress;
    //console.log(progress);
    if (delta<0) {
      clearInterval(timer); // end timer
      clearInterval(repeat); // end loop
      alert(txt);
    };
  },1000);
}
// TO HERE
// On toggle button clicks
function toggleView(id) {
  let ViewOff = document.getElementById(id + 'View');
  if (document.getElementById(id).checked == true) {
    ViewOff.style.display = 'block';
  } else {
    ViewOff.style.display = 'none';
  };
}

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

  // NEW CODE
  var vid = document.getElementById('video');
  var end_select = false;

  // delay = no. of cycles the message is displayed for
  var delay = 10; // initialise delay to be 0
  var max_count = 10;// initialise the total number of reps
  // write initial count
  document.getElementById('count').innerHTML = max_count;
  // don't run redrawing until model is set up
  //setTimeout(function() {
  repeat = setInterval(function(){
      if (start == true) {
        var last_el = trainingData[trainingData.length-1];

        //Only for RIGHT HAND
        var dx = (last_el["thumb4"][0]-last_el["pinky4"][0])
        var dy = (last_el["thumb4"][1]-last_el["pinky4"][1])
        var dist = Math.sqrt((dx*dx) + (dy*dy));
        // set level as 300px
        console.log(dist);

        if (count == max_count && end_ex == false) {
          end_ex = true; // exercise is completed
          end_sound.play();
          document.getElementById('img_container').style.background = '#FFEC69';
          // Make congrats message visible
          document.getElementById('popup_wrapper').style.visibility = 'visible';
          document.getElementById('congrats_msg').style.opacity = 1;
          document.getElementById('congrats_msg').style.letterSpacing = '3px';
          //alert("Exercise completed");
          //clearInterval(repeat);
        }
        else if (dist >=300 && fist == true && end_ex == false) {
          calib = true;
          fist = false;
          document.getElementById('notclose').style.display = 'none';
          draw_img(paper_img_array[0]);
        }
        else if (dist>=80 && dist<=120 && calib == true && fist == false && end_ex == false) {
          fist = true;
          sfx.play();
          draw_img(paper_img_array[1]);
          count++;
          // update count
          document.getElementById('count').innerHTML = max_count-count;
        }
        else if (end_ex == true && delay!=0) {
          delay--;
          //console.log(delay);
        }
        // Interaction to be carried out when exercise is completed
        else if (end_ex == true) {
          var mid = (last_el["bb"][0] + last_el["bb"][2])/2 // start calculating mid
          var right = document.getElementById('restart');
          var left = document.getElementById('end');
          var rightCount = document.getElementById('restartCount')
          var leftCount = document.getElementById('endCount')

          // hide congrats message
          document.getElementById('congrats_msg').style.letterSpacing = '0px';
          document.getElementById('congrats_msg').style.opacity = 0;

          //show end & restart selection buttons
          left.style.visibility = 'visible';
          left.style.opacity = 0.1;
          right.style.visibility =  'visible';
          right.style.opacity = 0.1;

          // RIGHT HAND SIDE INTERACTION
          if (mid<(vid.videoWidth/2)) {
            // Evaluate if side is coming from left (End button selected)
            if (end_select == true) {
              leftCount.innerHTML = "5"; // reset left timer
              console.log('INTERVAL TIMER IS CLEARED');
              clearInterval(timer);
              timer_start = false;
              left.style.opacity = 0.1;
            }
            right.style.opacity = 0.6;
            end_select = false;
            if (timer_start == false) {
              endEx('Restart exercise', rightCount);
            }
          }
          // LEFT HAND SIDE INTERACTION
          else if (mid>(vid.videoWidth/2)) {
            // Evaluate if side is coming from right (Restart button selected)
            if (end_select == false) {
              rightCount.innerHTML = "5"; // reset right timer
              console.log('INTERVAL TIMER IS CLEARED');
              clearInterval(timer);
              timer_start = false;
              right.style.opacity = 0.1;
            }
            left.style.opacity = 0.6;
            end_select = true;
            if (timer_start == false) {
              endEx('End exercise', leftCount);
            }
          }
        }
      }
    }, 250);
  //}, 5000)
}
