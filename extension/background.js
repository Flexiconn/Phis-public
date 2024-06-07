const data = '#000000';

chrome.runtime.onInstalled.addListener(async() => {
  console.log("extension has started")
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if(request.action == "SetNewURL"){
    console.log(request, sender, sendResponse);
    const requestOptions = {
      method: "GET",
      redirect: "follow"
      };

    fetch(`http://116.203.102.146:3000/linkobject?url=${request.data}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        var res = result
        chrome.storage.sync.set({ res });
      })
      .catch((error) => console.error(error));

  }
  return true
});