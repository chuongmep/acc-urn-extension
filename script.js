window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "fetchUrn") {
        const urn = getUrn();  // Assuming getUrn is a function that gets the current URN
        console.log("Fetching URN to send back to content script.");
        window.postMessage({type: "sendUrn", urn: urn}, "*");
    }
});

function getUrn() {
    return window.NOP_VIEWER.model.getData().urn;
}