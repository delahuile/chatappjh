import React, { Component } from 'react';
import {
    Redirect
  } from "react-router-dom";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";


export default class UsernameChange extends Component {
    constructor() {
      super();
      this.state = {
        error: null,
        newName: "",
        uid: "",
        redirect: false
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
      this.setState({
        [event.target.name]: event.target.value
      });
    }
  
    async handleSubmit(event) {
      event.preventDefault();
      try {
        db.ref("userID_Names").push({
            uid: auth().currentUser.uid,
            name: this.state.newName
        }).then(await auth().currentUser.updateProfile({ displayName: this.state.newName })).then(this.setRedirect);
      } catch (error) {

      }
    }

    renderRedirect = () => {
      if (this.state.redirect) {
        return <Redirect to='/chat' />
      }
    }

    setRedirect = () => {
      this.setState({
        redirect: true
      })
    }

    render() {
      return (
        <div className="username_change_div">
          <div>{this.renderRedirect()}</div>
          <form
            className="username_change_form"
            autoComplete="off"
            onSubmit={this.handleSubmit}
          >
            <p className="username_change_p">
              Enter a new username:
            </p>
            <div className="form-group">
              <input
                className="form-control"
                placeholder="Username"
                name="newName"
                type="newName"
                onChange={this.handleChange}
                value={this.state.newName}
              />
            </div>
            <div className="form-group">
              {this.state.error ? (
                <p className="text-danger">{this.state.error}</p>
              ) : null}
              <button className="btn-enter-username" type="submit">Submit</button>
            </div>

          </form>
  
        </div>
      );
    }
  }