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
import UsernameChange from "./pages/UsernameChange.js";
import { auth } from "./services/firebase";
import { db } from "./services/firebase";
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

function PublicRoute({ component: Component, authenticated, userAlreadyInusernameUIDs, appstate, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => 
        authenticated === false ? (
          <Component {...props} />
        ) : (
          userAlreadyInusernameUIDs ? (<Redirect to="/chat" />) : (<UsernameChange />)
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
      firstrun: true,
      userAlreadyInusernameUIDs: false
    };
  }

  componentDidMount() {

    this.setState({userAlreadyInusernameUIDs: false})
    
    auth().onAuthStateChanged(user => {
      if (user) {
        this.checkIfUserIsInUsernameUID();
      } else {
        console.log("no user is signed in")
        this.setState({
          authenticated: false,
          loading: false,
          userAlreadyInusernameUIDs: false
        });
      }
    });
  }

  checkIfUserIsInUsernameUID() {
    db.ref("userID_Names").once("value", snapshot => {
      snapshot.forEach((snap) => {
        if (snap.val().uid === auth().currentUser.uid) {
          this.setState({userAlreadyInusernameUIDs: true})
        }
      }
      );
    }).then( () => {console.log("authentication successfull");
    this.setState({
      authenticated: true,
      loading: false
    });
  }
  )
  }

  render() {
    return (this.state.loading === true)  ? (
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
              userAlreadyInusernameUIDs = {this.state.userAlreadyInusernameUIDs}
              component={Signup}
            />
            <PublicRoute
              path="/login"
              authenticated={this.state.authenticated}
              userAlreadyInusernameUIDs = {this.state.userAlreadyInusernameUIDs}
              component={Login}
            />
            <PublicRoute
              path="/"
              authenticated={this.state.authenticated}
              userAlreadyInusernameUIDs = {this.state.userAlreadyInusernameUIDs}
              component={Login}
            />
            <PublicRoute
              path="/usernamechange"
              authenticated={this.state.authenticated}
              userAlreadyInusernameUIDs = {this.state.userAlreadyInusernameUIDs}
              component={UsernameChange}
              appstate = {this}
            />
            <Route exact path="/" component={Login} />
          </Switch>
        </Router>
      );
  }
}

export default App;