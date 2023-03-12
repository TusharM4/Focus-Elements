let inblockList = true

let blockList = []
let allowList = []

// get the buttons
const blockListButton = document.getElementById('blockList-button')
const allowListButton = document.getElementById('allowList-button')
const saveButton = document.getElementById('save-button')

// make the blockList button green 
blockListButton.setAttribute('id', 'selected-button')

// get the text element
const infoText = document.getElementById('info-text')
const inputField = document.getElementById('input-field')

// initially we start showing the blockList
const showblockList = () => {
    // remove previous elements
    removeListElements()

    // change the text
    infoText.innerHTML = 'Currently Blocking All Websites On The blockList'

    // make the blockList button green and remove the id from allowList button
    blockListButton.setAttribute('id', 'selected-button')
    allowListButton.removeAttribute('id')

    inblockList = true
    blockList.forEach((item, index) => {
        createUrlElement(item, index)
    })

    // send the changed list to background script
    sendInfoToBackground()
}

const showallowList = () => {

    // remove previous elements
    removeListElements()

    // change the text
    infoText.innerHTML = 'Currently Allowing All Websites On The allowList'

    // make the blockList button green and remove the id from allowList button
    allowListButton.setAttribute('id', 'selected-button')
    blockListButton.removeAttribute('id')

    inblockList = false
    allowList.forEach((item, index) => {
        createUrlElement(item, index)
    })

    // send new list to the background script
    sendInfoToBackground()
}

const saveURL = () => {

    // get the value in the input field
    const inputFieldValue = inputField.value

    // remove the value from the input field
    document.getElementById('input-field').value = ''

    // first check that the input value isnt null
    if(inputFieldValue !== ''){
        // if the user saved it to the blockList then add it to the blockList otherwise add it to the allowList
        inblockList ? blockList.push(inputFieldValue) : allowList.push(inputFieldValue)

        // reprint the list
        inblockList ? showblockList() : showallowList()
    }

    saveListsToLocalStorage()
}

const createUrlElement = (text, index) => {
    // get the parent element to store the element
    const parentDiv = document.getElementById('url-list')

    // create the url element
    const urlDiv = document.createElement('div')
    urlDiv.setAttribute('class', 'url-div')

    // create the text for the url element
    const urlText = document.createElement('p')
    urlText.setAttribute('class', 'url-text')
    urlText.innerHTML = text

    // create the button for the url element
    const urlRemoveButton = document.createElement('button')
    urlRemoveButton.setAttribute('class', 'url-remove-button')
    urlRemoveButton.innerHTML = 'Remove'

    // add event listener to the button
    urlRemoveButton.addEventListener('click', () => removeElement(text))

    //add the elements to the div
    urlDiv.appendChild(urlText)
    urlDiv.appendChild(urlRemoveButton)

    // append the div to the parent div
    parentDiv.appendChild(urlDiv)
}

const removeElement = (item) => {
    if(inblockList){
        blockList = blockList.filter((currentItem) => {
            return currentItem !== item
        })
        showblockList()
    }else{
        allowList = allowList.filter((currentItem) => {
            return currentItem !== item
        })
        showallowList()
    }
    saveListsToLocalStorage()
}

const removeListElements = () => {
    
    // remove the previous list values from the dom
    const parent = document.getElementById("url-list")
    while (parent.firstChild) {
        parent.firstChild.remove()
    }
}

const sendInfoToBackground = () => {
    const port = chrome.extension.connect({
        name: "Sample Communication"
    });
    inblockList ? port.postMessage({type: 'blockList', list: blockList}) : port.postMessage({type: 'allowList', list: allowList})
}

const saveListsToLocalStorage = () => {
    const data = {currentState: inblockList,
                blockList: blockList,
                allowList: allowList}
    chrome.storage.local.set({value: data}, function(){
        console.log('saved')
    });
}

const getLocalSaves = () => {
    chrome.storage.local.get("value",function(storageData){
        data = storageData.value
        blockList = data.blockList
        allowList = data.allowList
        inblockList = data.currentState
        console.log(blockList, allowList, inblockList)

        // show the list for the user
        inblockList ? showblockList() : showallowList()
    });
}

blockListButton.addEventListener('click', showblockList)
allowListButton.addEventListener('click', showallowList)
saveButton.addEventListener('click', saveURL)

// allow for enter key presses on the input field
inputField.addEventListener('keypress', (event) => {
    if(event.code === "Enter"){
        saveURL()
    }
})

getLocalSaves()