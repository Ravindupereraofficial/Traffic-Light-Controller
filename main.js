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

    const gesture = detectGesture(results.multiHandLandmarks[0]);

    if (gesture.message !== lastSpokenMessage) {
        lastSpokenMessage = gesture.message; 
        stateElement.textContent = `Gesture: ${gesture.message}`;
        setLight(gesture.lightColor);
        updateSpeechText(gesture.message);
        speak(gesture.message);
    }
});

function detectGesture(handLandmarks) {
    const thumbTip = handLandmarks[4];
    const thumbIp = handLandmarks[3];
    const indexMcp = handLandmarks[5];

    if (thumbTip.y < thumbIp.y && thumbTip.y < indexMcp.y) {
        return { message: 'You Can Go Now', lightColor: 'green' }; // Thumbs-up
    } else if (thumbTip.y > thumbIp.y && thumbTip.y > indexMcp.y) {
        return { message: 'Stop your vehicle completely', lightColor: 'red' }; // Thumbs-down
    } else {
        return { message: 'Ready To Go', lightColor: 'yellow' }; // Neutral
    }
}

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

    
    setTimeout(() => {
        speechText.style.opacity = 0;
    }, 2000);
}

function speak(message) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel(); 
    }
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
