import React, { Component} from "react";
import Header from "../components/Header";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import "firebase/auth";


export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      currentUserName: "",
      chats: [],
      content: "",
      readError: null,
      writeError: null,
      loadingChats: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.processNameChange = this.processNameChange.bind(this);
    this.myRef = React.createRef();
  }

  async componentDidMount() {

    this.setState({ readError: null, loadingChats: true });
    const chatArea = this.myRef.current;
    try {
      const user = auth().currentUser;
      let name = "";
      db.ref("chats").on("value", snapshot => {
        let chats = [];
        snapshot.forEach((snap) => {
          chats.push(snap.val());
        });
        chats.sort(function (a, b) { return a.timestamp - b.timestamp })
        this.setState({ chats });
        chatArea.scrollBy(0, chatArea.scrollHeight);
        this.setState({ loadingChats: false }); 

        


        if (user != null) {
          
          user.providerData.forEach((function (profile) {
            console.log("Sign-in provider: " + profile.providerId);
            console.log("  Provider-specific UID: " + profile.uid);
            console.log("  Name: " + profile.displayName);
            console.log("  Email: " + profile.email);
            console.log("  Photo URL: " + profile.photoURL);
            if (auth().currentUser.displayName === profile.displayName) {
              name = profile.displayName;
            } else {
              name = auth().currentUser.displayName;
            }
            if (profile.displayName === null && auth().currentUser.displayName === null){
              name = "user" + ((Math.random())*1000000000).toFixed(0);
              auth().currentUser.updateProfile({ displayName: name});
            }
            console.log("CurrentUserName is " + this.state.currentUserName);
          }).bind(this));
        } 

        this.setState({currentUserName: name});
        
        console.log(chats);
        console.log(user.displayName);


      });

    } catch (error) {
      this.setState({ readError: error.message, loadingChats: false });
    }

    auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          currentUserName: auth().currentUser.displayName
        });

      }
    });
  }

  handleChange(event) {
    this.setState({
      content: event.target.value
    });
  }

  handleNameChange(event) {
    this.setState({
      currentUserName: event.target.value
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ writeError: null });
    const chatArea = this.myRef.current;
    try {
      await db.ref("chats").push({
        content: this.state.content,
        name: auth().currentUser.displayName,
        timestamp: Date.now(),
        uid: this.state.user.uid
      });
      this.setState({ content: '' });
      chatArea.scrollBy(0, chatArea.scrollHeight);
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  async processNameChange(event) {
    event.preventDefault();
    const previusName = auth().currentUser.displayName;
    auth().currentUser.updateProfile({ displayName: this.state.currentUserName});

    this.setState({ writeError: null });
    const chatArea = this.myRef.current;
    try {
      await db.ref("chats").push({
        content: "User " + previusName + " with email "  + this.state.user.email + " changed name to " + this.state.currentUserName,
        timestamp: Date.now(),
        uid: "9999"
      }).then(() =>{ 
        this.setState({ content: '' });
        this.setState({
          currentUserName: auth().currentUser.displayName
        });
      })
      this.setState({ content: '' });

      chatArea.scrollBy(0, chatArea.scrollHeight);
    } catch (error) {
      this.setState({ writeError: error.message });
    }

    
  }

  formatTime(timestamp) {
    const d = new Date(timestamp);
    const time = `${d.getDate()}/${(d.getMonth()+1)}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    return time;
  }

  render() {
    return (
      <div>
        <Header />

        <div className="chat-area" ref={this.myRef}>
          {/* loading indicator */}
          {this.state.loadingChats ? <div className="spinner-border text-success" role="status">
            <span className="sr-only">Loading...</span>
          </div> : ""}
          {/* chat area */}
          {this.state.chats.map(chat => {
            if (chat.uid === "9999"){
              return <p key={chat.timestamp} className={"namechange-bubble " + (this.state.user.uid === chat.uid ? "current-user" : "")}>
                <br />
                {chat.content}
                <br />
                <span className="chat-time float-right">{this.formatTime(chat.timestamp)}</span>
                </p>
            } else {
              return <p key={chat.timestamp} className={"chat-bubble " + (this.state.user.uid === chat.uid ? "current-user" : "")}>
                {chat.name} said:
                <br />
                {chat.content}
                <br />
                <span className="chat-time float-right">{this.formatTime(chat.timestamp)}</span>
              </p>

            }
          })}
        </div>
        <div>
          <form onSubmit={this.handleSubmit} className="mx-3">
            <textarea className="form-control" name="content" onChange={this.handleChange} value = {this.state.content} ></textarea>
            {this.state.error ? <p className="text-danger">{this.state.error}</p> : null}
            <button type="submit" className="btn btn-submit px-5 mt-4">Send message</button>
          </form>
        </div>
        <form onSubmit={this.processNameChange} className="mx-3">
          <textarea className="form-control" name="content" onChange={this.handleNameChange} value= {this.state.currentUserName}></textarea>
          {this.state.error ? <p className="text-danger">{this.state.error}</p> : null}
          <button type="submit" className="btn btn-submit px-5 mt-4">Change username</button>
        </form>
        <div className="py-5 mx-3">
          Login in as: <strong className="text-info">{this.state.user.email}</strong>, Current name in chat: <strong className="text-info">{auth().currentUser.displayName}</strong>
        </div>
      </div>
    );
  }
}