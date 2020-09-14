import React, {Component} from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import "./App.css";
import Dashboard from "./component/Dashboard";
import Documents from "./component/Documents";
import Profile from "./component/Profile";
import Layout from "./component/Layout";
import LoginForm from "./component/LoginForm";
import SignUpForm from "./component/SignUpForm";
import 'semantic-ui-css/semantic.min.css'

class App extends Component {

    render() {
        return(
            <BrowserRouter>
                <div className="App">
                <Switch>
                    <Route exact path="/" component={SignUpForm}/>
                    <Route exact path="/login" component={LoginForm}/>
                    {/*<Route path="/signup" component={SignUpForm}/>*/}

                    <Layout>
                        <Route exact path="/dashboard" component={Dashboard}/>
                        <Route exact path="/documents" component={Documents}/>
                        <Route exact path="/profile" component={Profile}/>
                    </Layout>
                </Switch>
                </div>
            </BrowserRouter>
        )
    }
}

export default App;
