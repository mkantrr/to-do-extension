/*global chrome*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TodoApp from './TodoApp';
import reportWebVitals from './reportWebVitals';


chrome.storage.sync.get("state", function (data) {
    console.log(data);
    chrome.tabs.query({ active: true, currentWindow: true, lastFocusedWindow: true }, (tabs) => {
        console.log(tabs[0]);
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                let text = "";
                let activeEl = document.activeElement;
                let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
                if (
                    (activeElTagName === "textarea") || ((activeElTagName === "input" &&
                        /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
                        (typeof activeEl.selectionStart == "number"))
                ) {
                    text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
                } else if (window.getSelection) {
                    text = window.getSelection().toString();
                }
                return text;
            }
        }, (result) => {
            const root = ReactDOM.createRoot(document.getElementById('list'));
            root.render(
                <React.StrictMode>
                    <TodoApp data={data} 
                        highlightedText={result}/>
                </React.StrictMode>
            );
        });
    });
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
