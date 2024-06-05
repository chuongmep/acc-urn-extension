
let devaritiveUrn = "";
document.addEventListener('DOMContentLoaded', function () {
    let output = document.getElementById("infoOutput");
    if (output) {
        output.style.display = "none";
    }
    
    if (document.getElementById("btn")) {
        document.getElementById("btn").addEventListener("click", handleButtonClick);
    }
    
});
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.urn) {
        console.log("Received URN in popup:", message.urn);
        devaritiveUrn = message.urn;
        localStorage.setItem("devaritiveUrn", devaritiveUrn)
    }
    return true; // Indicates an asynchronous response to avoid the port from closing
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleButtonClick() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "fetchUrn"});
    });
    await delay(100);
    // execute data fetching
    fetchCurrentTabInfo();
}

function fetchCurrentTabInfo() {
    
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, ([currentTab]) => {
        // console.log("Current URL: " + currentTab.url);
        
        if (isBIM360Url(currentTab.url)) {
            fetchBIM360Url(currentTab.url);
        }
        if (isAccUrl(currentTab.url)) {
            fetchInfo(currentTab.url);
        }
    });
}

function fetchInfo(url) {

    let project_id = url.match(/projects\/([^\/?#]+)/)?.[1] || '';
    let urlParams = new URLSearchParams(url.split('?')[1] || '');
    let folder_urn = urlParams.get('folderUrn') || '';
    let entity_id = urlParams.get('entityId') || '';
    let viewable_guid = urlParams.get('viewableGuid') || '';

    generateOutput(project_id, folder_urn, entity_id, viewable_guid)

    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', function () {
            copyValue(this.getAttribute('data-value'));
        });
    });
}

function generateOutput(project_id, folder_urn, entity_id, viewable_guid) {
    devaritiveUrn = localStorage.getItem("devaritiveUrn");
    let output = "<div class='info-item'><label>Project ID:</label> " + project_id + "<button class='copy-button' data-value='" + project_id + "'>Copy</button></div>";
    output += "<div class='info-item'><label>Folder URN:</label> " + folder_urn + "<button class='copy-button' data-value='" + folder_urn + "'>Copy</button></div>";
    output += "<div class='info-item'><label>Entity ID:</label> " + entity_id + "<button class='copy-button' data-value='" + entity_id + "'>Copy</button></div>";
    output += "<div class='info-item'><label>Viewable GUID:</label> " + viewable_guid + "<button class='copy-button' data-value='" + viewable_guid + "'>Copy</button></div>";
    output += "<div class='info-item'><label>URN:</label> " + devaritiveUrn + "<button class='copy-button' data-value='" + devaritiveUrn + "'>Copy</button></div>";
    let infoOutput = document.getElementById("infoOutput");
    infoOutput.innerHTML = output;
    infoOutput.innerHTML = output;
    infoOutput.style.display = "block";
    return output;
}

function fetchBIM360Url(url) {
    let project_id = url.match(/projects\/([^\/?#]+)/)?.[1] || '';
    let folder_urn = url.match(/folders\/([^\/?#]+)/)?.[1] || '';
    let entity_id = url.match(/items\/([^\/?#]+)/)?.[1] || '';
    let viewable_guid = ""

    generateOutput(project_id, folder_urn, entity_id, viewable_guid)

    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', function () {
            copyValue(this.getAttribute('data-value'));
        });
    });
}

function isBIM360Url(url) {
    return url.includes("docs.b360");
}

function isAccUrl(url) {
    // return url.includes("acc.autodesk.com");
    // add acc.autodesk.eu
    return url.includes("acc.autodesk");
}


function copyValue(value) {
    let dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = value;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    // alert('Copied: ' + value);
}
