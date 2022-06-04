let state = {
    listItems: [],
    textEntered: '',
    toggleDelete: false
}

chrome.runtime.onInstalled.addListener(() => {
        chrome.storage.sync.set({ "state": state }, function() {
            console.log("Saved state as default empty state items");
        });
});
