let defaultState = null;

chrome.runtime.onStartup.addListener( () => {
    chrome.storage.sync.get({ "state": defaultState }, (data) => {
        chrome.storage.sync.set({ "state": data.state }, function() {});
    });
});
