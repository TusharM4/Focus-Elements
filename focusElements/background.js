//Storage fuctions for the URLs
const filter = {
  urls: [],
}

//Does not allow input for the blockList
let inblockList = null

//Lists for lists
let allowList = []
let blockList = []

//
const webRequestFlags = [
  'blocking',
];


window.chrome.webRequest.onBeforeRequest.addListener(
  page => {
    //checks for allowList or blockList mode
    console.log(inblockList)
    console.log(page.url)
    
    //blocks all the urls that are in the blockList
    if(inblockList){        
        blockList.forEach((item) => {
            if(page.url.includes(item)){
                return {cancel: true}
            }
        })
        console.log('in blockList state')
    }
    
    else{
        console.log('in allowList state')
        //check that the url is in the allowList
        let flag = true
        allowList.forEach((item) => { page.url.includes(item) ? flag = false : null
        })

        //make sure that the js and css for the extension isnt blocked
        if(page.url.includes("popup.html") || page.url.includes("popup.js") || page.url.includes("popupStyle.css")){
            flag = false
        }

        //if flag is false allow request to go thru, or else block it
        if(flag){
            return {cancel: true}
        }
        else{
            return {cancel: false}
        }
    }
  },
  filter,
  webRequestFlags,
);

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if(msg.type === 'blockList'){
            inblockList = true
            blockList = msg.list
        }
        else if(msg.type === 'allowList'){
            inblockList = false
            allowList = msg.list
        }
    });
})

//Function for storage data
const listData = () => {
    chrome.storage.local.get("value",function(storageData){
        if(storageData.value.blockList !== null){
            data = storageData.value
            blockList = data.blockList
            allowList = data.allowList
            inblockList = data.currentState
            setblockListState(inblockList)
        }   
    });
}

const setblockListState = (state) => {
    inblockList = true
}


// retrieve the local storage data
listData()