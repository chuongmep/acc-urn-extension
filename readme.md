## APS ACC URL Details

![](/docs/firefox_yumhE9fZ2D.gif)

This is a simple extension allows you to get the APS ACC URL details include: 

- Project Id : A Project in Autodesk Forge is a specific workspace within a Hub. It's where the actual design and construction data is stored. Each project contains folders, items, and versions. The project id is unique for each project within a hub.

- Folder Urn : The folder urn is the unique identifier for a folder in a project. It is used to identify the folder in the project.
- Entity Id : The entity id is the unique identifier for an entity in a folder. It is used to identify the entity/item in the folder.
- Model View Id : The model view id is the unique identifier for a model view in a folder. It is used to identify the model view in the folder.

## Installation

- Chrome / Edge: Install From [Chrome Store](https://chromewebstore.google.com/detail/url-details-acc-extension/jjjpiegllaokfphbppbfenphdfmdhbjc)

- Firefox : TODO

## Development

### Firefox

- Manual Install :
    - Clone the repository
    - Open `about:debugging#/runtime/this-firefox`
    - Click on `Load Temporary Add-on...`
    - Select the `manifest.json` file from the cloned repository
    - The extension will be installed and you can see the icon in the toolbar
    - Open ACC Project and click on the icon to get the URL details

- Addon Online Store : [URL Details](https://addons.mozilla.org/en-US/firefox/addon/url-details-acc/)

### Chrome / Edge

- Manual Install :
    - Clone the repository
    - Open `chrome://extensions/`
    - Click on `Load unpacked`
    - Select the cloned repository
    - The extension will be installed and you can see the icon in the toolbar
    - Open ACC Project and click on the icon to get the URL details

- Addon Online Store : [URL Details](...)

## Documentation 

- [Firefox Developer](https://addons.mozilla.org/en-US/developers/addon/url-details-acc/edit)
- [Chrome Developer](https://chrome.google.com/webstore/devconsole/)
- [Edge Developer](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)
