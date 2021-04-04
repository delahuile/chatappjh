import React, { Component } from "react";
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect
} from "react-router-dom";
import Chat from "./pages/Chat.js";
import Signup from "./pages/Signup.js";
import Login from "./pages/Login.js";
import { auth } from "./services/firebase";
import './styles.css';

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authenticated === true ? (
          <Component {...props} />
        ) : (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          )
      }
    />
  );
}

function PublicRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => 
        authenticated === false ? (
          <Component {...props} />
        ) : (
            <Redirect to="/chat" />
          )
      }
    />
  );
}


class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: true,
      loading: true,
      firstrun: true
    };
  }

  componentDidMount() {
    
    auth().onAuthStateChanged(user => {
      if (user) {
        console.log("authentication successfull");
        this.setState({
          authenticated: true,
          loading: false
        });

      } else {
        console.log("no user is signed in")
        this.setState({
          authenticated: false,
          loading: false
        });
      }
    });
  }

  render() {
    return this.state.loading === true ? (
      <div className="spinner-border text-success" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    ) : (
        <Router>
          <Switch>
            <PrivateRoute
              path="/chat"
              authenticated={this.state.authenticated}
              component={Chat}
            />
            <PublicRoute
              path="/signup"
              authenticated={this.state.authenticated}
              component={Signup}
            />
            <PublicRoute
              path="/login"
              authenticated={this.state.authenticated}
              component={Login}
            />
            <PublicRoute
              path="/"
              authenticated={this.state.authenticated}
              component={Login}
            />
            <Route exact path="/" component={Login} />
          </Switch>
        </Router>
      );
  }
}

export default App;