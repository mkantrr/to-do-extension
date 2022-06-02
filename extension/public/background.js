let state = {
    listItems: [],
    textEntered: '',
    toggleDelete: false
}

chrome.runtime.onStartup.addListener(() => {
    chrome.storage.sync.get({ "state": ({ state }) }, (data) => {
        chrome.storage.sync.set({ "state": data.state }, function() {
            console.log("Saved state as default empty state items");
        });
    });
});

