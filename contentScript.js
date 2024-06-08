const loadScript = (scriptName) => {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(scriptName);
    (document.head || document.documentElement).appendChild(s);
    s.onload = () => {
        s.remove();  // Optional: remove the script element once loaded
    };
};

// Load your script.js that does the actual URN extraction
loadScript("script.js");

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "fetchUrn") {
        console.log("Popup requested URN, forwarding to page script.");
        window.postMessage({type: "fetchUrn"}, "*");
    }
});

window.addEventListener("message", function(event) {
    if (event.source !== window) return;

    if (event.data.type === "sendUrn") {
        const urn = event.data.urn;
        console.log("Received URN from page script:", urn);
        chrome.runtime.sendMessage({urn: urn});
    }
});

// Repeat the same for fetching the token
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "fetchToken") {
        console.log("Popup requested Token, forwarding to page script.");
        window.postMessage({type: "fetchToken"}, "*");
    }
});
window.addEventListener("message", function(event) {
    if (event.source !== window) return;

    if (event.data.type === "sendToken") {
        const token = event.data.token;
        console.log("Received Token from page script:", token);
        chrome.runtime.sendMessage({token: token});
    }
});