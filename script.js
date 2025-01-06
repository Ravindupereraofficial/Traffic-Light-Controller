const videoElement = document.getElementById('webcam');
const stateElement = document.getElementById('state');
const redLight = document.getElementById('red-light');
const yellowLight = document.getElementById('yellow-light');
const greenLight = document.getElementById('green-light');

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
});

hands.onResults((results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        return;
    }

    const handLandmarks = results.multiHandLandmarks[0];

    const thumbTip = handLandmarks[4];
    const thumbIp = handLandmarks[3];
    const indexMcp = handLandmarks[5];

    if (thumbTip.y < thumbIp.y && thumbTip.y < indexMcp.y) {
        // Thumbs-up 
        stateElement.textContent = 'Gesture: Thumbs Up';
        setLight('green');
    } else if (thumbTip.y > thumbIp.y && thumbTip.y > indexMcp.y) {
        // Thumbs-down 
        stateElement.textContent = 'Gesture: Thumbs Down';
        setLight('red');
    } else {
        // Neutral 
        stateElement.textContent = 'Gesture: Neutral';
        setLight('yellow');
    }
});

// Set the light
function setLight(color) {
    redLight.classList.remove('active');
    yellowLight.classList.remove('active');
    greenLight.classList.remove('active');

    if (color === 'red') {
        redLight.classList.add('active');
    } else if (color === 'yellow') {
        yellowLight.classList.add('active');
    } else if (color === 'green') {
        greenLight.classList.add('active');
    }
}

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
});

camera.start();