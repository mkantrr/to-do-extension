/*global chrome*/
import React, { useState, useEffect } from 'react';
import './TodoApp.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

//function to find selected text on any given html
let getSelectionText = () => {
    let text = "";
    let activeEl = document.activeElement;
    let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (activeElTagName === "textarea") || ((activeElTagName === "input" &&
            /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
            (typeof activeEl.selectionStart == "number"))
    ) {
        text = activeEl.value.slice(
        activeEl.selectionStart, 
        activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}

/*
 * Top level React functional component: takes in highlighted text
 * from current tab as a prop and gives TodoPage the highlighted text
 * as a prop. Also uses a div and header component for CSS styling
 */
function TodoApp(props) {
    return (
        <div className="App">
            <header className="App-header">
                <TodoPage /> 
            </header>
        </div>
    );
}

/*
 * Functional React component that does all of the interactive backend.
 * Stores functions and variables for handling changes on the extension popup.
 * Also uses chrome.storage.sync to sync the state of the extension between
 * popup sessions.
 */

function TodoPage(props) {
    //initalize state variables
    const [listItems, setListItems] = useState([]);
    const [textEntered, setTextEntered] = useState('');
    const [toggleDelete, setToggleDelete] = useState(false); 
    const [sorted, setSorted] = useState(true);

    useEffect(() => {  
        //restore state variables from values in chrome StorageArea when
        //new popup session is created
        chrome.storage.sync.get("state", function(data) {
            //grabs active tab when popup launched
            chrome.tabs.query({ 
                active: true, 
                currentWindow: true, 
                lastFocusedWindow: true }, (tabs) => {
                    console.log(tabs[0]);
                    //finds selected/highlighted text on active tab and returns it in result,
                    //passing it to callback function as result
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: getSelectionText
                    }, (result) => {
                        setListItems(property => property = data.state.listItems);
                        if (result[0].result) {
                            setTextEntered(property => property = result[0].result);
                        } else {
                            setTextEntered(property => property = data.state.textEntered);
                        }
                        setToggleDelete(property => property = data.state.toggleDelete);
                        setSorted(property => property = data.state.sorted);
                        console.log("Fetched state"); 
                    });
                });
        }); 
        console.log("Component mounted");
    },[]);

    useEffect(() => {
        //store state properties in chrome StorageArea when
        //anything in state is updated
        let saveState = {
            listItems: listItems,
            textEntered: textEntered,
            toggleDelete: toggleDelete,
            sorted: sorted
        }
        chrome.storage.sync.set({ "state": saveState }, function(data) {
            console.log("State has been updated, and has been saved to Chrome Storage Sync.");
        });

        //restores strikethrough text/isDone styling to list on new session
        //redundant when updating styling within current popup session
        for (let item of listItems) {
            item.isDone 
                ? document.getElementById(item.id).style.setProperty("text-decoration", "line-through")
                : document.getElementById(item.id).style.setProperty("text-decoration", "none");
        }
        //restores sorted state variable to inital state
        setSorted(true);
    }, [listItems, textEntered, toggleDelete, sorted]);

    function handleChange(event) {
        //sync textEntered state variable with typed text from user
        setTextEntered(event.target.value);
    }

    function handleSubmit(event) {
        //save new list item typed into text field into list items
        event.preventDefault();
        if (textEntered.length === 0) {
            return;
        }

        let item = {
            textEntered: textEntered, 
            id: textEntered,
            isDone: false
        };

        setListItems(listItems.concat(item));
        //sets text field value back to empty
        setTextEntered('');
    }

    function handleCompleted(event) {
        //find event target in listItems
        if (event.target.className === "textButton") { 
            let newListItems = listItems;
            for (let i=0; i < newListItems.length; i++) {
                if (newListItems[i].id === event.target.id) {
                    //invert isDone property of event target
                    newListItems[i].isDone = newListItems[i].isDone ? false : true; 
                    //save new properties ot list to listItems state variable
                    setListItems(newListItems);
                }
            }
        } else { 
            //logic to sort list
            let newListItems = listItems.sort(
                function(a,b){return a.isDone - b.isDone});
            setListItems(newListItems);
            //activate effect hook to update list as sorted
            setSorted(false);
        }
    }

    //handles logic to change in/out of delete mode and storing in state
    function handleToggleDelete(event) {
        let newToggleDelete = toggleDelete ? false : true;
        setToggleDelete(newToggleDelete);
    }

    function handleDelete(event) {
        //logic to find event target and remove it from lisItems, saving
        //it in state
        if (event.target.className === "textButton") {
            for (let i = 0; i < listItems.length; i++) {
                if (listItems[i].id === event.target.id) {
                    let newList1 = listItems.slice(0,i);
                    let newList2 = listItems.slice(i+1,listItems.length);
                    setListItems(newList1.concat(newList2));
                }
            }
        }
    }
    //renders TodoPage, passing variables and functions to TodoList component
    return (
        <div>
            <h2>TO-DO List</h2>
            <TodoList 
                listItems={listItems}
                toggleDelete={toggleDelete}
                handleDelete={handleDelete} 
                handleCompleted={handleCompleted} 
                sorted={sorted}
                setSorted={setSorted}/> 
            <div id="space" />
            <form onSubmit={handleSubmit}>
                <div>
                    <TextField 
                        variant="outlined" 
                        label="Enter an item"
                        onChange={handleChange}
                        value={textEntered} />
                </div>
                <div id="space" />
                <div>
                    <Button 
                        className="addButton" 
                        variant="outlined" 
                        color="primary" 
                        type="submit"> 
                        Add item #{listItems.length + 1}
                    </Button>
                    <FormControlLabel
                        className="deleteButton" 
                        checked={toggleDelete} 
                        control={<Switch checked={toggleDelete} onChange={handleToggleDelete} />}
                        color = "secondary"
                        label="Delete Mode"
                    />
                </div>
                <div id="space" />
            </form>
        </div>
    );
}

/*
 * React component used to store data for how the list is formatted and looks.
 * Also has the sort button that references prop functions to sort through the list.
 */
function TodoList(props) {

    function handleClick(event) {
        //top level branch for handling click on item in list if in delete mode
        if (props.toggleDelete === true) {  
            props.handleDelete(event); 
        } else {
            //top level branch for handling click on item in life if not in delete mode,
            //setting style to strikethrough text for event target to mark as completed
            props.handleCompleted(event);
            if (event.target.className === "textButton") {
                for (let i=0; i < props.listItems.length; i++) {
                    if (props.listItems[i].id === event.target.id) {
                        props.listItems[i].isDone
                            ? event.target.style.setProperty("text-decoration", "line-through")
                            : event.target.style.setProperty("text-decoration", "none");
                    }
                }
            }
            //sets sorted state variable to false to activate useEffect hook to update state
            //and StorageArea
            props.setSorted(false);
        }
    }
    //renders to do list and list interactivity, as well as the sort button
    return (
        <div>
            <ul>
                {props.listItems.map(item => (
                    <li key={item.id}>
                        <button 
                            className="textButton" 
                            id={item.id} 
                            onClick={handleClick}>
                            {item.textEntered} 
                        </button>
                    </li>
                ))}
            </ul> 
            <div id="space" />
            <div>
                <Button 
                    variant="outlined" 
                    color="secondary"  
                    onClick={handleClick}>
                    Sort
                </Button>
            </div>
        </div>
    );
}

//exports to index.js
export default TodoApp;

