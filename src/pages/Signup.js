import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { signup, signInWithGoogle, signInWithGitHub } from "../helpers/auth";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";

export default class SignUp extends Component {

  constructor() {
    super();
    this.state = {
      error: null,
      email: '',
      password: '',
      username: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.googleSignIn = this.googleSignIn.bind(this);
    this.githubSignIn = this.githubSignIn.bind(this);
    
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ error: '' });
    try {
      await signup(this.state.email, this.state.password)
      .then( () => {
        db.ref("userID_Names").push({
          uid: auth().currentUser.uid,
          name: this.state.username
        }
        )
      })

    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  async googleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  async githubSignIn() {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.log(error)
      this.setState({ error: error.message });
    }
  }

  render() {
    return (
      <div className="container">
        <form className="mt-5 py-5 px-5" onSubmit={this.handleSubmit}>
          <h1>
            Sign Up to <span> </span>
          <Link className="title ml-2" to="/">ChatAppJH</Link>
          </h1>
          <p className="lead">Fill in the form below to create an account.</p>
          <div className="form-group">
            <input className="form-control" placeholder="Username" name="username" type="username" onChange={this.handleChange} value={this.state.username}></input>
          </div>
          <div className="form-group">
            <input className="form-control" placeholder="Email" name="email" type="email" onChange={this.handleChange} value={this.state.email}></input>
          </div>
          <div className="form-group">
            <input className="form-control" placeholder="Password" name="password" onChange={this.handleChange} value={this.state.password} type="password"></input>
          </div>
          <div className="form-group">
            {this.state.error ? <p className="text-danger">{this.state.error}</p> : null}
            <button className="btn-signup-password" type="submit">Sign up</button>
          </div>
          <p>You can also sign up with any of these services</p>
          <button className="btn-signup-googlesignin" type="button" onClick={this.googleSignIn}>
            Sign up with Google
          </button>
          <span > </span>
          <button className="btn-signup-githubsignin" type="button" onClick={this.githubSignIn}>
            Sign up with GitHub
          </button>
          <hr></hr>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </form>
      </div>
    )
  }
}