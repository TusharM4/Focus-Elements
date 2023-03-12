let inBlackList = true

let blacklist = []
let whitelist = []

// get the buttons
const blackListButton = document.getElementById('blacklist-button')
const whiteListButton = document.getElementById('whitelist-button')
const saveButton = document.getElementById('save-button')

// make the blacklist button green 
blackListButton.setAttribute('id', 'selected-button')

// get the text element
const infoText = document.getElementById('info-text')
const inputField = document.getElementById('input-field')

// initially we start showing the blacklist
const showBlackList = () => {
    // remove previous elements
    removeListElements()

    // change the text
    infoText.innerHTML = 'currently blocking websites on the blacklist'

    // make the blacklist button green and remove the id from whitelist button
    blackListButton.setAttribute('id', 'selected-button')
    whiteListButton.removeAttribute('id')

    inBlackList = true
    blacklist.forEach((item, index) => {
        createUrlElement(item, index)
    })

    // send the changed list to background script
    sendInfoToBackground()
}

const showWhiteList = () => {

    // remove previous elements
    removeListElements()

    // change the text
    infoText.innerHTML = 'currently allowing websites on the whitelist'

    // make the blacklist button green and remove the id from whitelist button
    whiteListButton.setAttribute('id', 'selected-button')
    blackListButton.removeAttribute('id')

    inBlackList = false
    whitelist.forEach((item, index) => {
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
        // if the user saved it to the blacklist then add it to the blacklist otherwise add it to the whitelist
        inBlackList ? blacklist.push(inputFieldValue) : whitelist.push(inputFieldValue)

        // reprint the list
        inBlackList ? showBlackList() : showWhiteList()
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
    if(inBlackList){
        blacklist = blacklist.filter((currentItem) => {
            return currentItem !== item
        })
        showBlackList()
    }else{
        whitelist = whitelist.filter((currentItem) => {
            return currentItem !== item
        })
        showWhiteList()
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
    inBlackList ? port.postMessage({type: 'blacklist', list: blacklist}) : port.postMessage({type: 'whitelist', list: whitelist})
}

const saveListsToLocalStorage = () => {
    const data = {currentState: inBlackList,
                blacklist: blacklist,
                whitelist: whitelist}
    chrome.storage.local.set({value: data}, function(){
        console.log('saved')
    });
}

const getLocalSaves = () => {
    chrome.storage.local.get("value",function(storageData){
        data = storageData.value
        blacklist = data.blacklist
        whitelist = data.whitelist
        inBlackList = data.currentState
        console.log(blacklist, whitelist, inBlackList)

        // show the list for the user
        inBlackList ? showBlackList() : showWhiteList()
    });
}

blackListButton.addEventListener('click', showBlackList)
whiteListButton.addEventListener('click', showWhiteList)
saveButton.addEventListener('click', saveURL)

// allow for enter key presses on the input field
inputField.addEventListener('keypress', (event) => {
    if(event.code === "Enter"){
        saveURL()
    }
})

getLocalSaves()