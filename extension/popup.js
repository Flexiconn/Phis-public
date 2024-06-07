// Initialize button with users' preferred color
const changeColor = document.getElementById('turnOn');
var hasBeenEnabled = true
chrome.storage.sync.get('res', async ({ res }) => {
  var urlBar = document.getElementsByClassName("URL")[0]
  urlBar.innerHTML = res.url
  var statusbar = document.querySelector(".statusbar")
  statusbar.innerHTML = res.status
  console.log(res)
  if(res.status == "Phishing"){
    statusbar.style.backgroundColor = "#DD5757"
    statusbar.style.color = "white"
    statusbar.innerHTML = "Unsafe URL"
    document.getElementById("reasoning").style.display = "block"
    document.getElementById("Explanation").style.display = "block"
  } else {
    statusbar.style.backgroundColor = "#0CED07"
    statusbar.style.color = "black"
    statusbar.innerHTML = "Safe URL"
    document.querySelector("body").style.height = "120px"
    document.getElementById("reasoning").style.display = "none"
    document.getElementById("Explanation").style.display = "none"
  }

  var reasonList = document.getElementsByClassName('ReasoningContainer')[0]
  reasonList.innerHTML = ''
  if(res.status == "Phishing"){
    for(let i = 0; i < res.reasons.length; i++){
      reasonList.innerHTML += GetDescription(res.reasons[i].reason)
    }

    var container = document.getElementsByClassName("ReasoningContainer")[0].children
    container[0].addEventListener('click',(event) => {
      SetExplanation(event.target.id)
    })
    container[1].addEventListener('click',(event) => {
      SetExplanation(event.target.id)
    })
    container[2].addEventListener('click',(event) => {
      SetExplanation(event.target.id)
    })
    container[3].addEventListener('click',(event) => {
      SetExplanation(event.target.id)
    })
    container[4].addEventListener('click',(event) => {
      SetExplanation(event.target.id)
    })
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.action == "changePopup"){
      console.log(request, sender, sendResponse);
    }
  })

function SetExplanation(reason){
  chrome.storage.sync.get('res', async ({ res }) => {
    res.reasons.forEach(x => {
      if(x.reason == reason)
        document.getElementsByClassName("Explanation")[0].innerHTML = `Explanation<br/>${x.explanation}`
    })
  })
}

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: InsertButtons
  });

  changeColor.classList.toggle("TurnOn")
  changeColor.classList.toggle("On")

});



// The body of this function will be executed as a content script inside the
// current page
async function InsertButtons() {

    var allLinks = document.querySelectorAll('a')
    allLinks.forEach(link => {
        var urls = new URL(link.href)
        if(urls.host == window.location.host) {
          
        } else{
          var href=document.createElement("button");
          href.className = "UngradedURL"
          href.innerText = "Check URL";
          href.style.backgroundColor = "#7388f3"
          href.style.borderRadius = "10px"
          href.style.border = "0px"
          href.id = link
          href.onclick = async() => {
            chrome.runtime.sendMessage({ action: "SetNewURL", data: link.href }, function(response){
              console.log(response.response)
            });

          }
          link.after(href)
      }
    })
}


function GetDescription(feature){
  if(feature == "nb_hyperlinks"){
    return `<div class="Reason"><span>There are a lot of hyperlinks on the page</span><button id='${feature}'>Learn more</button></div>`
  }

  if(feature == "safe_anchor"){
    return `<div class="Reason"><span>A lot of the links refer to external websites</span><button id='${feature}'>Learn more</button></div>`
  }

  if(feature == "page_rank"){
    return `<div class="Reason"><span>The page has a low page rank</span><button id='${feature}'>Learn more</button></div>`
  }

  if(feature == "page_index"){
    return `<div class="Reason"><span>The page has no page rank</span><button id='${feature}'>Learn more</button></div>`
  }

  if(feature == "brand_in_subdomain"){
    return `<div class="Reason"><span>There's a brand in the subdomain</span><button id='${feature}'>Learn more</button></div>`
  }

  if(feature == "lon"){
    return `<div class="Reason"><span>The physical location of the traffic origin is suspicious</span><button id='${feature}'>Learn more</button></div>`
  }

  if(feature == "iframe"){
    return `<div class="Reason"><span>The website contains an iframe</span><button id='${feature}'>Learn more</button></div>`
  }
}