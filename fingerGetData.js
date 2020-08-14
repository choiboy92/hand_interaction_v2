

const video = document.querySelector("video")
let videoReady = false
let modelReady = false
let model
let state = 'waiting';
let targetLabel;
let brain;
let trainingData = []

function successCallback(stream) {
  console.log("success camear")
    video.width = 640; video.height = 480;//prevent Opencv.js error.
    video.srcObject = stream;
    video.play();
    video.style.display = "none"
    captureStart = true
}

const constraints = {
    video: { facingMode: "user", }, audio: false
};

function errorCallback(error) {
    console.log(error);
}


// navigator.mediaDevices.getUserMedia(constraints, successCallback, errorCallback)

// navigator.getUserMedia(constraints, successCallback, errorCallback);

const userMedia = navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
        width: 555,
        height: 480,
        facingMode: 'environment'
    }
});

userMedia.then(function (stream) {
    const videoEl = document.getElementById('video');

    const videoTracks = stream.getVideoTracks()[0];
    console.log('카메라 이름 : ' + videoTracks.label);

    videoEl.srcObject = stream;
    video.play();

}).catch(function (error) {
    console.error(error.message);
});



async function main() {
  // Load the MediaPipe handpose model.
  model = await handpose.load();
  // model = await facemesh.load();
  modelReady = true

  // console.log(model)

}


video.onloadeddata = () => {
    videoReady = true
    main()
}


function keyPressed() {
  if (key == 's') {
    saveJSON(trainingData, "trainingXYZ.json")
    state = "saving"
    console.log(state)

    // brain.saveData();
  }
  else if (key == "w") {
    state = "waiting"
    console.log(state)
  }
  else {
    targetLabel = key;
    console.log(targetLabel);
    if (key != "F12")
    {
      setTimeout(function() {
        console.log('collecting');
        state = 'collecting';
      }, 2000);
    }

  }
}



function setup() {
  //scale canvas down from 555, 480
  let canv = createCanvas(222, 192);
  //var ctx = canv.getContext("2d");
  //canv.scale(0.4,0.4)
  canv.parent("jumbo");

}

fingerNum = {0:"palm", 1:"thumb1", 2:"thumb2", 3:"thumb3", 4:"thumb4",
             5:"index1", 6:"index2", 7:"index3", 8:"index4",
             9:"middle1", 10:"middle2", 11:"middle3", 12:"middle4",
             13:"ring1", 14:"ring2", 15:"ring3", 16:"ring4",
             17:"pinky1", 18:"pinky2", 19:"pinky3", 20:"pinky4"}

var data = new Array();

async function draw() {
    clear();
    background('#222222');
    stroke(0,255,0);
    translate(256, 0);
    scale(-0.4,0.4);
    if (modelReady)
    {
      // console.log("11111111")
      // console.log("model", model)
      // console.log(video)
        const predictions = await model.estimateHands(video);
        // console.log("222222222")
        // const predictions = await model.estimateFaces(video);

        let cor = {}
        cor.bb = []
        z_list = []

         // && state == "collecting"

        if (predictions.length > 0)
        {
          // console.log(predictions)
          // console.log("length!!!!!!", predictions.length)

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

          fill(255,0,0)
          ellipse(BXTLx, BXTLy, 10,10)
          ellipse(BXBRx, BXBRy, 10,10)
          ellipse((BXTLx + BXBRx) / 2, (BXTLy + BXBRy) / 2, 10,10)

          // console.log("~~~~~~~~~~~~~~~~")
          // console.log(Math.abs(index[3][0] - ((BXTLx + BXBRx) / 2)), Math.abs(index[3][1] - ((BXTLy + BXBRy) / 2)), index[3][2])
          // console.log(index[3][0], index[3][1], index[3][2])
          // console.log("@@@@@@@@@@@@@")


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
            // console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);

            ellipse(x,y,10,10)
            textSize(20);
            text(i, x, y)
            // cor.feature.push(x/640)
            // cor.feature.push(y/480)
            // z_list.push(Math.abs(z))

            let column = fingerNum[i]
            // console.log("col:::", column)

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
          // console.log("trainingData", trainingData)
          // console.log(cor["index1"]);
          // data.push(cor);
        }

        else
        {
          console.log("no detecting")
        }

        // if (predictions.length > 0 && state == "collecting") {
        //     // console.log(predictions)
        //     // console.log("length!!!!!!", predictions.length)

        //     const hand = predictions[0]

        //     const index = hand.annotations.indexFinger;
        //     const thumb = hand.annotations.thumb
        //     const pinky = hand.annotations.pinky
        //     const ring = hand.annotations.ringFinger
        //     const middle = hand.annotations.middleFinger

        //     const keypoints = predictions[0].landmarks;
        //     console.log(keypoints.length)


        //     for (let i = 0; i < keypoints.length; i++) {
        //         const [x, y, z] = keypoints[i];
        //         console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);

        //         ellipse(x,y,10,10)
        //         // cor.feature.push(x/640)
        //         // cor.feature.push(y/480)
        //         // z_list.push(Math.abs(z))


        //         cor.feature.push(z)
        //         cor.feature.push(z)
        //         cor.feature.push(z)

        //     }

        //     // let z_max = Math.max(...z_list)
        //     // let z_min = Math.min(...z_list)

        //     // // normalizing z value

        //     // for (const z of z_list) {
        //     //   let norm_z = (z - z_min) / (z_max - z_min)
        //     //   cor.feature.push(norm_z)
        //     // }

        //     // // number of cor.feature : 63 (21 * 3 [x1,y1,x2,y2, ..., z1, z2, ..,z21])
        //     // cor.label = targetLabel
        //     trainingData.push(cor)

        // }

        // else
        // {
        //     console.log("no detecting  !!!!!!!")
        // }
    }
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}
