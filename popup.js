let devaritiveUrn = "";
let token = "";
document.addEventListener("DOMContentLoaded", function () {
  let output = document.getElementById("infoOutput");
  if (output) {
    output.style.display = "none";
  }

  if (document.getElementById("btn")) {
    localStorage.removeItem("devaritiveUrn");
    localStorage.removeItem("token");
    document.getElementById("btn").addEventListener("click", handleButtonClick);
  }
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.urn != null) {
    console.log("Received URN in popup:", message.urn);
    devaritiveUrn = message.urn;
    localStorage.setItem("devaritiveUrn", devaritiveUrn);
  }
  if (message.token != null) {
    console.log("Received Token in popup:", message.token);
    token = message.token;
    localStorage.setItem("token", token);
  }
  return true; // Indicates an asynchronous response to avoid the port from closing
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleButtonClick() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "fetchUrn" });
    chrome.tabs.sendMessage(tabs[0].id, { action: "fetchToken" });
  });
  await delay(100);
  // execute data fetching
  await fetchCurrentTabInfo();
}

async function fetchCurrentTabInfo() {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    ([currentTab]) => {
      // console.log("Current URL: " + currentTab.url);

      if (isBIM360Url(currentTab.url)) {
        fetchBIM360Url(currentTab.url);
      }
      if (isAccUrl(currentTab.url)) {
        fetchInfo(currentTab.url);
      }
    }
  );
}

async function fetchInfo(url) {
  let project_id = "b." + url.match(/projects\/([^\/?#]+)/)?.[1] || "";
  let urlParams = new URLSearchParams(url.split("?")[1] || "");
  let folder_urn = urlParams.get("folderUrn") || "";
  let version_id = urlParams.get("entityId") || "";
  let viewable_guid = urlParams.get("viewableGuid") || "";

  generateOutput(project_id, folder_urn, version_id, viewable_guid);

  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", function () {
      copyValue(this.getAttribute("data-value"));
    });
  });
}

async function generateOutput(
  project_id,
  folder_urn,
  version_id,
  viewable_guid
) {
  devaritiveUrn = localStorage.getItem("devaritiveUrn");
  token = localStorage.getItem("token");
  item_id = version_id.split("?")[0];
  // if versionid not contains ? then versionid is empty
  if (version_id.indexOf("?") == -1) {
    version_id = "";
  }
  // wait for fetchManifestJson fetch data done
  let manifestJson = await fetchManifestJson(devaritiveUrn, token);
  if (!manifestJson) {
    console.log("Failed to fetch manifest JSON.");
    manifestJson = {};
  }
  // download AEC Model
  let modelData = await downloadAECModelUrl(devaritiveUrn, manifestJson);
  if (!modelData) {
    console.log("Failed to fetch modelData.");
    modelData = {};
  }
  // Generate output HTML
  let output = `
        <div class='info-item'><label>Project ID:</label> ${project_id} <button class='copy-button' data-value='${project_id}'>Copy</button></div>
        <div class='info-item'><label>Folder URN:</label> ${folder_urn} <button class='copy-button' data-value='${folder_urn}'>Copy</button></div>
        <div class='info-item'><label>Item Id:</label> ${item_id} <button class='copy-button' data-value='${item_id}'>Copy</button></div>
        <div class='info-item'><label>Version Id:</label> ${version_id} <button class='copy-button' data-value='${version_id}'>Copy</button></div>
        <div class='info-item'><label>Viewable Guid:</label> ${viewable_guid} <button class='copy-button' data-value='${viewable_guid}'>Copy</button></div>
        <div class='info-item'><label>Urn:</label> ${devaritiveUrn.substring(0,51)}... <button class='copy-button' data-value='${devaritiveUrn}'>Copy</button></div>
        <div class='info-item'><label>Token:</label> ${token.substring(0,51)}... <button class='copy-button' data-value='${token}'>Copy</button></div>
        <div class='info-item'><label>Manifest Json:</label> ${JSON.stringify(manifestJson).substring(0,51)}... <button class='copy-button' data-value='${JSON.stringify(manifestJson,null,2)}'>Copy</button></div>
        <div class='info-item'><label>ModelData Json:</label> ${JSON.stringify(modelData).substring(0,51)}... <button class='copy-button' data-value='${JSON.stringify(modelData,null,2)}'>Copy</button></div>
        `;

  // Update the output container
  let infoOutput = document.getElementById("infoOutput");
  infoOutput.innerHTML = output;
  infoOutput.style.display = "block";

  // Add event listeners for copy buttons
  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", function () {
      copyValue(this.getAttribute("data-value"));
    });
  });
}

async function fetchManifestJson(urn, token) {
  let url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`;
  try {
    let response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    let data = await response.json();
    return data; // Return the fetched JSON data
  } catch (error) {
    console.error("Error fetching manifest JSON:", error);
    return null; // Return null or handle the error gracefully
  }
}

async function downloadAECModelUrl(urn, jsonManifest) {
  try {
    let derivativeUrn = await getUrnByRole(jsonManifest);
    var dev_url = ` https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest/${derivativeUrn}`;
    console.log("AEC Model URL: ", dev_url);
    token = localStorage.getItem("token");
    let response = await fetch(dev_url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    let data = await response.json();
    console.log("AEC Model Data: ", data);
    return data;

    //TODO: NEW V2 Not working well : 
    // 1. https://aps.autodesk.com/en/docs/model-derivative/v2/reference/http/urn-manifest-derivativeUrn-signedcookies-GET/
    // 2. https://aps.autodesk.com/blog/download-derivative-files-using-new-signedcookies-api-without-setting-cookies-first-header
    //3. https://stackoverflow.com/questions/38441808/autodesk-forge-file-conversion-how-to-download-files-in-manifest
    // let aecModelUrl = data.url;
    // encodeURI
    // aecModelUrl = encodeURI(data.url, "UTF-8");
    // let aecModelUrl = data.url + "?";
    // In this case we get all 3 'Set-Cookie'    headers in a single string
    // separated by commas. We need to split them up and set them individually
    // const cookie = response.headers.get("Set-Cookie").replaceAll(",", ";");
    // const cookies = cookie.split("; ");
    // for (const cookie of cookies) {
    //   let [name, value] = cookie.split("=");
    //   if (name.startsWith("CloudFront-")) {
    //     name = name.replace("CloudFront-", "");
    //     aecModelUrl += `${name}=${value}&`;
    //   }
    // }
    //console.log("Download AEC Model URL: ", aecModelUrl);
    // read json from aecModelUrl
    //var json_string = await dowloadJsonAecModelUrl(aecModelUrl);
    //return json_string; // Return the fetched JSON data
  } catch (error) {
    console.error("Error fetching manifest JSON:", error);
    return null; // Return null or handle the error gracefully
  }
}
async function dowloadJsonAecModelUrl(aecModelUrl) {
  // get json string from aecModelUrl
  let response = await fetch(aecModelUrl);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  let jsonstring = await response.json();
  return jsonstring;
}

// Function to get URN of ModelData.json
async function getUrnByRole(jsonstring) {
  // load json string
  let data = JSON.parse(JSON.stringify(jsonstring));
  let targetRole = "Autodesk.AEC.ModelData";
  if (data.derivatives) {
    for (const derivative of data.derivatives) {
      if (derivative.children) {
        for (const child of derivative.children) {
          if (child.role === targetRole) {
            return child.urn;
          }
        }
      }
    }
  }
  return null;
}

function fetchBIM360Url(url) {
  let project_id = url.match(/projects\/([^\/?#]+)/)?.[1] || "";
  let folder_urn = url.match(/folders\/([^\/?#]+)/)?.[1] || "";
  let entity_id = url.match(/items\/([^\/?#]+)/)?.[1] || "";
  let viewable_guid = "";

  generateOutput(project_id, folder_urn, entity_id, viewable_guid);

  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", function () {
      copyValue(this.getAttribute("data-value"));
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
