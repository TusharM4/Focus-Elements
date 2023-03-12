const filter = {
    urls: [],
  }
  
  let inBlacklist = null
  
  let whitelist = []
  let blacklist = []
  
  const webRequestFlags = [
    'blocking',
  ];
  
  window.chrome.webRequest.onBeforeRequest.addListener(
    page => {
      //we first want to check if we are in whitelist or blacklist mode
      console.log(inBlacklist)
      console.log(page.url)
      if(inBlacklist){
          // block all the urls that are in the blacklist
          blacklist.forEach((item) => {
              if(page.url.includes(item)){
                  return {cancel: true}
              }
          })
          console.log('in blacklist state')
      }else{
          console.log('in whitelist state')
          // check that the url is in the whitelist
          let flag = true
          whitelist.forEach((item) => { page.url.includes(item) ? flag = false : null
          })
  
          // and lastly check that the extension js and css files are not being blocked
          if(page.url.includes("popup.html") || page.url.includes("popup.js") || page.url.includes("popupStyle.css")){
              flag = false
          }
  
          // if the flag has been made false then we allow the request otherwise block it
          if(flag){
              return {cancel: true}
          }else{
              return {cancel: false}
          }
      }
    },
    filter,
    webRequestFlags,
  );
  
  chrome.extension.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(msg) {
          if(msg.type === 'blacklist'){
              inBlacklist = true
              blacklist = msg.list
          }else if(msg.type === 'whitelist'){
              inBlacklist = false
              whitelist = msg.list
          }
      });
  })
  
  const getLocalSaves = () => {
      chrome.storage.local.get("value",function(storageData){
          if(storageData.value.blacklist !== null){
              data = storageData.value
              blacklist = data.blacklist
              whitelist = data.whitelist
              inBlackList = data.currentState
              setBlackListState(inBlacklist)
          }   
      });
  }
  
  const setBlackListState = (state) => {
      inBlacklist = true
  }
  
  
  // retrieve the local storage data
  getLocalSaves()