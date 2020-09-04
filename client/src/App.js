import React, {Component} from "react";
import {BrowserRouter,Route} from "react-router-dom";
import "./App.css";
import Signup from "./component/SignUp";
import Login from "./component/Login";
import Home from "./component/Home";

class App extends Component {

    render() {
        return(
            <BrowserRouter>
                <div className="App">
                    <Route exact path="/" component={Signup}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/home" component={Home}/>
                </div>
            </BrowserRouter>
        )
    }
}

export default App;
