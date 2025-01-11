const videoElement = document.getElementById('webcam');
const stateElement = document.getElementById('state');
const redLight = document.getElementById('red-light');
const yellowLight = document.getElementById('yellow-light');
const greenLight = document.getElementById('green-light');
const speechText = document.getElementById('speech-text'); // Added speech text element

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
});

let lastSpokenMessage = '';  // Store the last spoken message to avoid repeating the same speech

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
        gestureMessage = 'Green Light';
        lightColor = 'green';
    } else if (thumbTip.y > thumbIp.y && thumbTip.y > indexMcp.y) {
        // Thumbs-down
        gestureMessage = 'Red Light';
        lightColor = 'red';
    } else {
        // Neutral (Thumbs neutral)
        gestureMessage = 'Yellow Light';
        lightColor = 'yellow';
    }

    // Avoid speaking the same message continuously
    if (gestureMessage !== lastSpokenMessage) {
        lastSpokenMessage = gestureMessage;  // Update the last spoken message
        stateElement.textContent = `Gesture: ${gestureMessage}`;
        setLight(lightColor);
        updateSpeechText(gestureMessage);
        speak(gestureMessage);  // Speak the gesture message in real-time
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

// Update speech text visibility
function updateSpeechText(message) {
    speechText.textContent = `Speech: ${message}`;
    speechText.style.opacity = 1;

    // Hide the speech text after a few seconds
    setTimeout(() => {
        speechText.style.opacity = 0;
    }, 2000); // Fade out after 2 seconds
}

// Speak the message using Speech Synthesis API
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
