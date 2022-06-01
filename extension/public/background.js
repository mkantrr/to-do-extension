chrome.runtime.onSuspend.addListener((handleSaveState()) => {
    this.state = {
        listItems: chrome.storage.sync.get('listItems', (result) => {
            setState({ listItems: result });
        }),
        textEntered: chrome.storage.sync.get('textEntered', (result) => {
            setState({ textEntered: result });
        }),
        toggleDelete: chrome.storage.sync.get('toggleDelete', (result) => {
            setState({ toggleDelete: result });
        })
    }
});

chrome.runtime.onStartup.addListener((handleSaveState()) => {
    chrome.storage.sync.set({
        listItems: [],
        textEntered: '',
        toggleDelete: false
    });
});
