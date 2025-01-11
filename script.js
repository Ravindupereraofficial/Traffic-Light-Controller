const videoElement = document.getElementById('webcam');
const stateElement = document.getElementById('state');
const redLight = document.getElementById('red-light');
const yellowLight = document.getElementById('yellow-light');
const greenLight = document.getElementById('green-light');

// Variable to track the current traffic light state
let currentState = null;

// Check for speech synthesis support
if (!('speechSynthesis' in window)) {
    alert('Your browser does not support speech synthesis. Voice feedback will not work.');
}

// Initialize Mediapipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
});

// Process gesture results
hands.onResults((results) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        return;
    }

    const handLandmarks = results.multiHandLandmarks[0];

    const thumbTip = handLandmarks[4];
    const thumbIp = handLandmarks[3];
    const indexMcp = handLandmarks[5];

    let gesture = 'Neutral';
    if (thumbTip.y < thumbIp.y && thumbTip.y < indexMcp.y) {
        // Thumbs-up
        gesture = 'Green';
        stateElement.textContent = 'Gesture: Thumbs Up';
        setLight('green');
    } else if (thumbTip.y > thumbIp.y && thumbTip.y > indexMcp.y) {
        // Thumbs-down
        gesture = 'Red';
        stateElement.textContent = 'Gesture: Thumbs Down';
        setLight('red');
    } else {
        // Neutral
        gesture = 'Yellow';
        stateElement.textContent = 'Gesture: Neutral';
        setLight('yellow');
    }

    // Provide voice feedback only if the state changes
    if (currentState !== gesture) {
        currentState = gesture; // Update current state
        provideVoiceFeedback(gesture); // Speak the new state
    }
});

// Function to set the traffic light
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

// Function to provide voice feedback based on the gesture
function provideVoiceFeedback(gesture) {
    let message = '';

    if (gesture === 'Red') {
        message = 'Traffic light is now red.';
    } else if (gesture === 'Yellow') {
        message = 'Traffic light is now yellow.';
    } else if (gesture === 'Green') {
        message = 'Traffic light is now green.';
    }

    if (message) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.pitch = 1; // Adjust pitch (range: 0 to 2)
        utterance.rate = 1;  // Adjust rate (range: 0.1 to 10)
        window.speechSynthesis.speak(utterance);
    }
}

// Initialize webcam and start detection
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480,
});

camera.start();
