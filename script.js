
window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "fetchUrn") {
        const urn = getUrn();  // Assuming getUrn is a function that gets the current URN
        console.log("Fetching URN to send back to content script.");
        window.postMessage({type: "sendUrn", urn: urn}, "*");
    }
});

window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "fetchToken") {
        const token = getToken();  // Assuming getUrn is a function that gets the current URN
        console.log("Fetching Token to send back to content script.");
        window.postMessage({type: "sendToken", token: token}, "*");
    }
});

function getUrn() {
    if(window.NOP_VIEWER == null){
        return "";
    }
    var result = window.NOP_VIEWER.model.getData().urn;
    if(result!=null){
        return result;
    }
    return "";
}

function getToken(){
    if(window.Autodesk == null || window.Autodesk.Viewing == null || window.Autodesk.Viewing.token == null){
        return "";
    }
   return window.Autodesk.Viewing.token.accessToken; 
}