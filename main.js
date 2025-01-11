const videoElement = document.getElementById('webcam');
const stateElement = document.getElementById('state');
const redLight = document.getElementById('red-light');
const yellowLight = document.getElementById('yellow-light');
const greenLight = document.getElementById('green-light');
const speechText = document.getElementById('speech-text'); 

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
});

let lastSpokenMessage = '';  

hands.onResults((results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        return;
    }

    const handLandmarks = results.multiHandLandmarks[0];
    const thumbTip = handLandmarks[4];
    const thumbIp = handLandmarks[3];
    const indexMcp = handLandmarks[5];

    let gestureMessage = '';
    let lightColor = '';

    if (thumbTip.y < thumbIp.y && thumbTip.y < indexMcp.y) {
        // Thumbs-up
        gestureMessage = ' Stop your vehicle completely and wait for the green light';
        lightColor = 'green';
    } else if (thumbTip.y > thumbIp.y && thumbTip.y > indexMcp.y) {
        // Thumbs-down
        gestureMessage = 'Stop your vehicle completely and wait for the green light';
        lightColor = 'red';
    } else {
        // Neutral 
        gestureMessage = 'Slow down and prepare to stop as the light is about to turn red';
        lightColor = 'yellow';
    }

    
    if (gestureMessage !== lastSpokenMessage) {
        lastSpokenMessage = gestureMessage;  
        stateElement.textContent = `Gesture: ${gestureMessage}`;
        setLight(lightColor);
        updateSpeechText(gestureMessage);
        speak(gestureMessage);  
    }
});


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


function updateSpeechText(message) {
    speechText.textContent = `Speech: ${message}`;
    speechText.style.opacity = 1;

    // Hide the speech text after a few seconds
    setTimeout(() => {
        speechText.style.opacity = 0;
    }, 2000);
}

// Speak the message using  API
function speak(message) {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
}

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
});

camera.start();
