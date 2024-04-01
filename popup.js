document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("infoOutput").style.display = "none";
    document.getElementById("btn").addEventListener("click", fetchCurrentTabInfo);
});

function fetchCurrentTabInfo() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
      }, ([currentTab]) => {
        console.log("Current URL: " + currentTab.url);
        fetchInfo(currentTab.url);
      });
}

function fetchInfo(url) {

    var project_id = url.match(/projects\/([^\/?#]+)/)?.[1] || '';
    var urlParams = new URLSearchParams(url.split('?')[1] || '');
    var folder_urn = urlParams.get('folderUrn') || '';
    var entity_id = urlParams.get('entityId') || '';
    var viewable_guid = urlParams.get('viewableGuid') || '';

    var output = "<div class='info-item'><label>Project ID:</label> " + project_id + "<button class='copy-button' data-value='" + project_id + "'>Copy</button></div>";
    output += "<div class='info-item'><label>Folder URN:</label> " + folder_urn + "<button class='copy-button' data-value='" + folder_urn + "'>Copy</button></div>";
    output += "<div class='info-item'><label>Entity ID:</label> " + entity_id + "<button class='copy-button' data-value='" + entity_id + "'>Copy</button></div>";
    output += "<div class='info-item'><label>Viewable GUID:</label> " + viewable_guid + "<button class='copy-button' data-value='" + viewable_guid + "'>Copy</button></div>";


    document.getElementById("infoOutput").innerHTML = output;
    infoOutput.innerHTML = output;
    infoOutput.style.display = "block";

    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', function () {
            copyValue(this.getAttribute('data-value'));
        });
    });
}


function copyValue(value) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = value;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    // alert('Copied: ' + value);
}
