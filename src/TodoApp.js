/*global chrome*/
import React from 'react';
import './TodoApp.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';


class TodoApp extends React.Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <TodoPage {...this.props}/>
                </header>
            </div>
        );
    }
}

class TodoPage extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCompleted = this.handleCompleted.bind(this);
        this.handleToggleDelete = this.handleToggleDelete.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.state = {
            listItems: [],
            textEntered: '',
            toggleDelete: false
        }
    }

    componentDidMount() {
        console.log(this.props.state);
        console.log(this.props.state.listItems);
        let newListItems = this.props.state.listItems;
        let newTextEntered = this.props.state.textEntered;
        let newToggleDelete = this.props.state.toggleDelete;
        this.setState({
            listItems: newListItems,
            textEntered: newTextEntered,
            toggleDelete: newToggleDelete
        }); 
        console.log("Component mounted");

    }

    componentDidUpdate() {
        let saveState = this.state;
        chrome.storage.sync.set({ "state": saveState }, function() {
            console.log("State has been updated, and has been saved to Chrome Storage Sync.");
            console.log(saveState);
        });

        if (!this.state.toggleDelete && this.state.listItems.length > 0) {
            for (let item of this.state.listItems) {
                item.isDone 
                    ? document.getElementById(item.id).style.setProperty("text-decoration", "line-through")
                    : document.getElementById(item.id).style.setProperty("text-decoration", "none");
            }
        }
    }

    handleChange(event) {
        this.setState({ textEntered: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.state.textEntered.length === 0) {
            return;
        }

        let item = {
            textEntered: this.state.textEntered, 
            id: this.state.textEntered,
            isDone: false
        };

        this.setState(state => ({
            listItems: this.state.listItems.concat(item), 
            textEntered: ''
        }));

    }

    handleCompleted(event) {
       if (event.target.className === "textButton") { 
           let newListItems = this.state.listItems;
            for (let i=0; i < newListItems.length; i++) {
                if (newListItems[i].id === event.target.id) {
                    newListItems[i].isDone = newListItems[i].isDone ? false : true; 
                    this.setState({ listItems: newListItems });
                }
            }
       } else {
           this.setState(state => ({
               listItems: this.state.listItems.sort(
                   function(a,b){return a.isDone - b.isDone})
           }));
       }
    }

    handleToggleDelete(event) {
        let newToggleDelete = this.state.toggleDelete ? false : true;
        this.setState({ toggleDelete: newToggleDelete });
    }

    handleDelete(event) {
        if (event.target.className === "textButton") {
            for (let i = 0; i < this.state.listItems.length; i++) {
                if (this.state.listItems[i].id === event.target.id) {
                    let newList1 = this.state.listItems.slice(0,i);
                    let newList2 = this.state.listItems.slice(i+1,this.state.listItems.length);
                    this.setState(state => ({
                        listItems: newList1.concat(newList2)
                    }));
                }
            }
        }
    }
        


    render() {
        return (
            <div>
                <h2>TO-DO List</h2>
                <TodoList 
                listItems={this.state.listItems}
                toggleDelete={this.state.toggleDelete}
                handleDelete={this.handleDelete} 
                handleCompleted={this.handleCompleted} /> 
                <div id="space" />
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <TextField 
                            variant="outlined" 
                            label="Enter an item"
                            onChange={this.handleChange} 
                            value={this.state.textEntered} />
                    </div>
                    <div id="space" />
                    <div>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            type="submit"> 
                            Add item #{this.state.listItems.length + 1}
                        </Button>
                        <div id="space" />
                        <FormControlLabel
                            checked={this.state.toggleDelete} 
                            control={<Switch checked={this.state.toggleDelete} onChange={this.handleToggleDelete} />}
                            color = "secondary"
                            label="Delete Mode"
                        />
                    </div>
                    <div id="space" />
                </form>
            </div>
        );
    }                    
}

class TodoList extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);

    }

    handleClick(event) {
        if (this.props.toggleDelete === true) {  
            this.props.handleDelete(event); 
        } else {
            this.props.handleCompleted(event);
            if (event.target.className === "textButton") {
                for (let i=0; i < this.props.listItems.length; i++) {
                    if (this.props.listItems[i].id === event.target.id) {
                        this.props.listItems[i].isDone
                            ? event.target.style.setProperty("text-decoration", "line-through")
                            : event.target.style.setProperty("text-decoration", "none");
                    }
                }
            }
        }
    }

    render() {
        return (
            <div>
                <ul>
                    {this.props.listItems.map(item => (
                        <li key={item.id}>
                            <button 
                                className="textButton" 
                                id={item.id} 
                                onClick={this.handleClick}>
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
                        onClick={this.handleClick}>
                        Sort completed items
                    </Button>
                </div>
            </div>
        )
    }

}

export default TodoApp;

