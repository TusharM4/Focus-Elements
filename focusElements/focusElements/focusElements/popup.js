let inBlackList = true

let blockList = []
let allowList = []

// gets the buttons
const blackListButton = document.getElementById('blacklist-button')
const whiteListButton = document.getElementById('whitelist-button')
const saveButton = document.getElementById('save-button')

// make the blacklist button green 
blackListButton.setAttribute('id', 'selected-button')

// get the text element
const infoText = document.getElementById('info-text')
const inputField = document.getElementById('input-field')

// initially we start showing the blacklist
const showBlocks = () => {
    // remove previous elements
    removeLinks()

    // change the text
    infoText.innerHTML = 'Currently Blocking All Websites On The Blacklist'

    // make the blacklist button green and remove the id from whitelist button
    blackListButton.setAttribute('id', 'selected-button')
    whiteListButton.removeAttribute('id')

    inBlackList = true
    blockList.forEach((item, index) => {
        createUrlElement(item, index)
    })

    // send the changed list to background script
    sendInfoToBackground()
}

// display whitelist
const showAllows = () => {

    // remove previous elements
    removeLinks()

    // change the text
    infoText.innerHTML = 'Currently Allowing Websites On The Whitelist'

    // make the blacklist button green and remove the id from whitelist button
    whiteListButton.setAttribute('id', 'selected-button')
    blackListButton.removeAttribute('id')

    inBlackList = false
    allowList.forEach((item, index) => {
        createUrlElement(item, index)
    })

    // send new list to the background script
    sendInfoToBackground()
}

// save the urls
const saveURL = () => {

    // get the value in the input field
    const inputFieldValue = inputField.value

    // remove the value from the input field
    document.getElementById('input-field').value = ''

    // first check that the input value isnt null
    if(inputFieldValue !== ''){
        // if the user saved it to the blacklist then add it to the blacklist otherwise add it to the whitelist
        inBlackList ? blockList.push(inputFieldValue) : allowList.push(inputFieldValue)

        // reprint the list
        inBlackList ? showBlocks() : showAllows()
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

// removes elements from array
const removeElement = (item) => {
    if(inBlackList){
        blockList = blockList.filter((currentItem) => {
            return currentItem !== item
        })
        showBlocks()
    }else{
        allowList = allowList.filter((currentItem) => {
            return currentItem !== item
        })
        showAllows()
    }
    saveListsToLocalStorage()
}

// remove previous elements in the list
const removeLinks = () => {
    
    // remove the previous list values from the dom
    const parent = document.getElementById("url-list")
    while (parent.firstChild) {
        parent.firstChild.remove()
    }
}

// sent the list data to background
const sendInfoToBackground = () => {
    const port = chrome.extension.connect({
        name: "Sample Communication"
    });
    inBlackList ? port.postMessage({type: 'blacklist', list: blockList}) : port.postMessage({type: 'whitelist', list: allowList})
}

const saveListsToLocalStorage = () => {
    const data = {currentState: inBlackList,
                blacklist: blockList,
                whitelist: allowList}
    chrome.storage.local.set({value: data}, function(){
        console.log('saved')
    });
}

// pull saves from local storage
const getLocalSaves = () => {
    chrome.storage.local.get("value",function(storageData){
        data = storageData.value
        blockList = data.blacklist
        allowList = data.whitelist
        inBlackList = data.currentState
        console.log(blockList, allowList, inBlackList)

        // show the list for the user
        inBlackList ? showBlocks() : showAllows()
    });
}

blackListButton.addEventListener('click', showBlocks)
whiteListButton.addEventListener('click', showAllows)
saveButton.addEventListener('click', saveURL)

// allow for enter key presses on the input field
inputField.addEventListener('keypress', (event) => {
    if(event.code === "Enter"){
        saveURL()
    }
})

getLocalSaves()