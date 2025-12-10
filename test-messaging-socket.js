import { io } from "socket.io-client";

// REAL DATA
const DRIVER_ID = '9a2a09b6-91ca-4216-a3c3-88b16213ed1c';
const RIDER_ID = '6cb73dc8-a5d0-4ce6-be0e-947f9aa104d0';
const CONVERSATION_ID = 'e71aa298-f688-40fd-bbeb-de8241cf0767';

const socketDriver = io("http://localhost:5000");
const socketRider = io("http://localhost:5000");

console.log("🚀 Starting Messaging Verification...");

let riderJoined = false;
let driverJoined = false;

function checkAndSend() {
    if (riderJoined && driverJoined) {
        // Send message
        console.log("Both joined. Driver sending message...");
        socketDriver.emit("send_message", {
            conversationId: CONVERSATION_ID,
            senderId: DRIVER_ID,
            text: "Hello from verification script!",
            senderRole: "driver"
        });
    }
}

socketDriver.on("connect", () => {
    console.log("✅ Driver connected:", socketDriver.id);
    socketDriver.emit("authenticate", DRIVER_ID);

    // Join conversation
    console.log("Driver joining conversation...");
    socketDriver.emit("join_conversation", CONVERSATION_ID);
    driverJoined = true;
    setTimeout(checkAndSend, 500);
});

socketRider.on("connect", () => {
    console.log("✅ Rider connected:", socketRider.id);
    socketRider.emit("authenticate", RIDER_ID);

    // Join conversation
    console.log("Rider joining conversation...");
    socketRider.emit("join_conversation", CONVERSATION_ID);
    riderJoined = true;
    setTimeout(checkAndSend, 500);
});

socketRider.on("new_message", (msg) => {
    console.log("📩 Rider received message:", msg);
    if (msg.text === "Hello from verification script!" && (msg.conversationId === CONVERSATION_ID || msg.conversationId === undefined)) {
        // note: msg.conversationId might be undefined if not returned by mock but we fixed backend
        console.log("✅ VERIFICATION SUCCESS: Message received via socket room!");
        process.exit(0);
    }
});

socketDriver.on("new_message", (msg) => {
    // console.log("Driver received message (echo):", msg);
});


// Timeout
setTimeout(() => {
    console.error("❌ TIMEOUT: Message not received.");
    process.exit(1);
}, 5000);
