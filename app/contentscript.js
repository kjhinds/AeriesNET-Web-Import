var s = document.createElement('script');
s.src = chrome.extension.getURL("script.js");
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);

function saveData(StudentList){
    chrome.storage.local.clear();
    chrome.storage.local.set(StudentList);
};

function loadData(){
    chrome.storage.local.get(null,function(StudentList){console.log(StudentList);});
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.command){
        case "import":
            window.postMessage({ text: request.message}, '*');
            break;
        case "getRoster":
            window.postMessage({ text: request.message}, '*');
            break;
        case "loadData":
            loadData();
            break;
        default:
            break;
    };
  });
 
window.addEventListener('message', function(event) {
    if (event.origin != "https://teacherportal.abcusd.us") {
        return false;
    } else {
        switch(event.data.command) {
            case "save":
                saveData({StuList: event.data.text});
                break;
            case "openPopup":
                saveData({ StuList: event.data.text });
                break;
            default:
                return false;
        }
    };
});