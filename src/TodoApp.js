import React from 'react';
import { ReactComponent as Logo } from './logo.svg';
import './TodoApp.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const logoStyle = {
    fill: 'white',
};

class TodoApp extends React.Component {
    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <Logo style={logoStyle} className="App-logo" alt="logo" />
                    <TodoPage />
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
        this.state = { listItems: [], textEntered: '' };
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
            id: (this.state.listItems.length + 1).toString(),
            isDone: false
        };

        this.setState(state => ({
            listItems: this.state.listItems.concat(item), 
            textEntered: ''
        }));

    }

    handleCompleted(event) {
       if (event.target.className === "textButton") { 
           let newListItems = [...this.state.listItems];
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

    render() {
        return (
            <div>
                <h2>TO-DO List</h2>
                <TodoList 
                listItems={this.state.listItems} 
                onCompleted={this.handleCompleted} /> 
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
                    </div>
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
        this.props.onCompleted(event);
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
