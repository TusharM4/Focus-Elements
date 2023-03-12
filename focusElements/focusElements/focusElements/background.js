const filter = {
    urls: [],
  }
  
  let inBlocks = null
  
  let allowList = []
  let blockList = []
  
  const webRequestFlags = [
    'blocking',
  ];
  
  window.chrome.webRequest.onBeforeRequest.addListener(
    page => {
      // checks if its in whitelist or blacklist mode
      console.log(inBlocks)
      console.log(page.url)
      if(inBlocks){
          // blocks all the urls that are in the blacklist
          blockList.forEach((item) => {
              if(page.url.includes(item)){
                  return {cancel: true}
              }
          })
          console.log('in blacklist state')
      }
      else{
          console.log('in whitelist state')
          // checks that the url is in the whitelist
          let flag = true
          allowList.forEach((item) => { page.url.includes(item) ? flag = false : null
          })
  
          // and lastly check that the extension js and css files are not being blocked
          if(page.url.includes("popup.html") || page.url.includes("popup.js") || page.url.includes("popupStyle.css") || page.url.includes("newtab.html") || page.url.includes("newtab.css")){
              flag = false
          }
  
          // if the flag has been made false then we allow the request otherwise block it
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
  // checks for activity
  chrome.extension.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(msg) {
          if(msg.type === 'blacklist'){
              inBlocks = true
              blockList = msg.list
          }
          else if(msg.type === 'whitelist'){
              inBlocks = false
              allowList = msg.list
          }
      });
  })
  // gets local whitelist/blacklist data
  const getSaves = () => {
      chrome.storage.local.get("value",function(storageData){
          if(storageData.value.blacklist !== null){
              data = storageData.value
              blockList = data.blacklist
              allowList = data.whitelist
              inBlackList = data.currentState
              sBlockState(inBlocks)
          }   
      });
  }
  
  const sBlockState = (state) => {
      inBlocks = true
  }
  
  
  // retrieves the local storage data
  getSaves()