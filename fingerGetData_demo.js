function begindemo1() {
  console.log('begindemo1 clicked');
}

var vid_ar = document.querySelectorAll("video")
const video = vid_ar[vid_ar.length-1];
let videoReady = false
let modelReady = false
let model
let state = 'waiting';
let targetLabel;
let trainingData = []
let start_draw = false;

function begindemo() {
  document.getElementById('overlay').style.opacity = 0.8;
  document.getElementById('overlay').style.zIndex = 100;
  console.log('begindemo clicked');
  document.getElementById('beginDemo').style.visibility = 'hidden';
  // detect device camera
  const userMedia = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
          width: 555,
          height: 480,
          facingMode: 'user' // front camera , back camera : "environment"
      }
  });

  userMedia.then(function (stream) {
      const videoEl = document.getElementById('demo_video');

      const videoTracks = stream.getVideoTracks()[0];
      console.log('카메라 이름 : ' + videoTracks.label);

      // videoEl.srcObject = stream;
      video.srcObject = stream;

      video.play();

  }).catch(function (error) {
      console.error(error.message);
  });

  var prompt = setInterval(function() {
    if (start_draw == true) {
      document.getElementById('overlay').style.opacity = 0;
      document.getElementById('overlay').style.zIndex = 0;
      clearInterval(prompt);
    }
  },500);
};

// load model
async function main() {
  // Load the MediaPipe handpose model.
  model = await handpose.load();
  // model = await facemesh.load();
  modelReady = true
}


// wait until video ready
video.onloadeddata = () => {
    videoReady = true
    // video ready then load model
    main()
}





function setup() {
  //scale canvas down from 555, 480
  let canv = createCanvas(333, 288);
  // capture = createCapture(VIDEO);
  // capture.size(640, 480);
  // capture.hide();
  canv.parent("jumbo");
}


fingerNum = {0:"palm", 1:"thumb1", 2:"thumb2", 3:"thumb3", 4:"thumb4",
             5:"index1", 6:"index2", 7:"index3", 8:"index4",
             9:"middle1", 10:"middle2", 11:"middle3", 12:"middle4",
             13:"ring1", 14:"ring2", 15:"ring3", 16:"ring4",
             17:"pinky1", 18:"pinky2", 19:"pinky3", 20:"pinky4"}


async function draw() {
    clear()
    background('#222222')
    stroke(0,255,0)
    translate(384, 0);
    scale(-0.6,0.6)
    if (modelReady)
    {
        const predictions = await model.estimateHands(video);

        let cor = {}
        cor.bb = []

        if (predictions.length > 0)
        {
          start_draw = true;
          const hand = predictions[0]

          const index = hand.annotations.indexFinger;
          const thumb = hand.annotations.thumb
          const pinky = hand.annotations.pinky
          const ring = hand.annotations.ringFinger
          const middle = hand.annotations.middleFinger
          const palm = hand.annotations.palmBase[0]

          let BXBR = hand.boundingBox.bottomRight
          let BXTL = hand.boundingBox.topLeft
          const BXBRx = BXBR[0]
          const BXBRy = BXBR[1]
          const BXTLx = BXTL[0]
          const BXTLy = BXTL[1]

          const keypoints = predictions[0].landmarks;

          const arr = [index, thumb, pinky, ring, middle]

          // drawing bounding BOX
          fill(255,0,0)
          // bounding box TOP LEFT
          ellipse(BXTLx, BXTLy, 10,10)
          // bounding box BOTTOM RIGHT
          ellipse(BXBRx, BXBRy, 10,10)
          // bounding box center
          ellipse((BXTLx + BXBRx) / 2, (BXTLy + BXBRy) / 2, 10,10)


          // drawing fingers
          fill(0,0,255)
          for (const finger of arr) {
              if (finger != undefined)
              {
                  for (let i = 0; i < finger.length; i++)
                  {
                      let fingerX = finger[i][0]
                      let fingerY = finger[i][1]
                      ellipse(fingerX, fingerY, 5, 5)

                      if (i == 0)
                      {
                          const palmX = palm[0]
                          const palmY = palm[1]

                          line(palmX, palmY, fingerX, fingerY)
                      }

                      else
                      {
                          const baseFingerX = finger[i-1][0]
                          const baseFingerY = finger[i-1][1]

                          line(baseFingerX, baseFingerY, fingerX, fingerY)
                      }
                  }
              }
          }


          for (let i = 0; i < keypoints.length; i++) {
              const [x, y, z] = keypoints[i];

              ellipse(x,y,10,10)
              textSize(20);
              text(i, x, y)

              let column = fingerNum[i]

              cor[column] = []

              cor[column].push(x)
              cor[column].push(y)
              cor[column].push(z)

          }

          cor.bb.push(BXTLx)
          cor.bb.push(BXTLy)
          cor.bb.push(BXBRx)
          cor.bb.push(BXBRy)

          cor.label = targetLabel

          trainingData.push(cor)

        }

        else
        {
          console.log("no detecting")
        }


    }
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}
