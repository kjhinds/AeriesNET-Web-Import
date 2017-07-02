function checkForValidUrl(tabId, changeInfo, tab) {
    var regex = new RegExp(/https:\/\/teacherportal.abcusd.us\/Aeries.Net\/gradebook\/\S*\/\S*\/[Ss]coresByClass/g);
    var match = regex.exec(tab.url); 
    // We only display the Page Action if we are inside a tab that matches
    if(match && changeInfo.status == 'complete') {
        chrome.pageAction.show(tabId);
    }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);