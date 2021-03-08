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
      loadingChats: false,
      isMounted: false,
      snapName: "",
      isEmailLogin: false,
      snapKey: "",
      userAlreadyInuserID_NamesFlag: false
    };
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.processNameChange = this.processNameChange.bind(this);
    this.myRef = React.createRef();
    this.setCurrentUsername = this.setCurrentUsername.bind(this);
    this.checkOrCreateUsername = this.checkOrCreateUsername.bind(this);
  }

  async componentDidMount() {

    this.setState({isMounted: true});
    this.setState({ readError: null, loadingChats: true });
    const chatArea = this.myRef.current;
    try {
      const user = auth().currentUser;

      console.log("current uid is " + auth().currentUser.uid)

      db.ref("chats").on("value", snapshot => {

        // fetches chats from firebase database and creates scrollable chatarea
        let chats = [];
        snapshot.forEach((snap) => {
          chats.push(snap.val());
        });
        chats.sort(function (a, b) { return a.timestamp - b.timestamp })
        this.setState({ chats });
        chatArea.scrollBy(0, chatArea.scrollHeight);
        this.setState({ loadingChats: false }); 

        console.log(chats);
        console.log(user.displayName);

      });

      this.checkOrCreateUsername();

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

  //Checks if user has already been given name in signup or create a reandom username if signup is via google or github
  async checkOrCreateUsername(){

    // signup with email
    if (auth().currentUser.displayName === null) {

      db.ref("userID_Names").on("value", snapshot => {
      snapshot.forEach((snap) => {
        if (snap.val().uid === auth().currentUser.uid){
          this.setState({isEmailLogin: true});
          console.log("snap uid is " + snap.val().uid);
          console.log("username in snap is " + snap.val().name);
          this.setState({snapName: snap.val().name});
          console.log("isEmailLogin first is " + this.state.isEmailLogin);
          auth().currentUser.updateProfile({ displayName: snap.val().name}).then(() => this.setCurrentUsername(snap.val().name));

          //snapkey is key to the usernameUid data
          this.setState({snapKey: snap.key});

          console.log("snap key is " + this.state.snapKey);

        }
       } 
      );
      //sign-up with google or github
    if(!this.state.isEmailLogin) {

      console.log("isEmailLogin third is " + this.state.isEmailLogin);

      let randomUserName = this.createRandomUsername();

      db.ref("userID_Names").push({
        uid: auth().currentUser.uid,
        name: randomUserName
      }
      )
      auth().currentUser.updateProfile({ displayName: randomUserName}).then(() => this.setCurrentUsername(randomUserName));
    }
    })

    } else {
      // if displayName is not null, currentUser already has username that is pushed into userID_Names
      let userAlreadyInuserID_Names = false;
      db.ref("userID_Names").once("value", snapshot => {
        snapshot.forEach((snap) => {
          console.log("snap.uid is " + snap.val().uid);
          console.log("auth() uid is " + auth().currentUser.uid);
          console.log("snap.val().uid isequal auth().currentUser.uid " + (snap.val().uid === auth().currentUser.uid));
          if (snap.val().uid === auth().currentUser.uid){
            console.log("snap match found")
            userAlreadyInuserID_Names = true;
            //snapkey is key to the usernameUid data
            this.setState({snapKey: snap.key})
          }
         } 
        );
        this.setState({userAlreadyInuserID_NamesFlag: true});
      }).then( () => {
        if(!userAlreadyInuserID_Names){
          console.log("!userAlreadyInuserID_Names " + !userAlreadyInuserID_Names);
  
          db.ref("userID_Names").push({
            uid: auth().currentUser.uid,
            name: auth().currentUser.displayName
          });
        }
      }
      ).then( () => {
        //after possibly pushing userid_uid let's set snapkey if not already set
        db.ref("userID_Names").once("value", snapshot => {
          snapshot.forEach((snap) => {
            console.log("snap.uid is " + snap.val().uid);
            console.log("auth() uid is " + auth().currentUser.uid);
            console.log("snap.val().uid isequal auth().currentUser.uid " + (snap.val().uid === auth().currentUser.uid));
            if (snap.val().uid === auth().currentUser.uid){
              console.log("snap match found")
              userAlreadyInuserID_Names = true;
              //snapkey is key to the usernameUid data
              this.setState({snapKey: snap.key});
            }
           } 
          );
          this.setState({userAlreadyInuserID_NamesFlag: true});
        })
    }  

      );
    }
  }

  //Creates random username for google and github users
  createRandomUsername () {
    let randomName = "user" + ((Math.random())*1000000000).toFixed(0);
    console.log("created random username");
    return randomName;
  }

  async setCurrentUsername(name){ 
    console.log("isEmailLogin after is " + this.state.isEmailLogin)
    this.setState({currentUserName: name});
    console.log("auth().currentuser.displayname is " + auth().currentUser.displayName)
  }

  componentWillUnmount(){
    var unsubscribe = auth().onAuthStateChanged(function () {
      
    });
    unsubscribe();
  }

  handleContentChange(event) {
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

    //updating auth() profile displayName
    auth().currentUser.updateProfile({ displayName: this.state.currentUserName}).then(
      () => {
        console.log("response is ");
        try {
          //pushing up a message into the chat that the username has been changed
          db.ref("chats").push({
            content: "User " + previusName + " with email "  + this.state.user.email + " changed name to " + this.state.currentUserName,
            timestamp: Date.now(),
            uid: "9999"
          }).then(() => { 
            this.setState({ content: '' });
            this.setState({
              currentUserName: auth().currentUser.displayName
            });
            //updating also username in realtime database
            db.ref('userID_Names').child(this.state.snapKey).update({name: auth().currentUser.displayName})
          })
        } catch (error) {
          this.setState({ writeError: error.message });
        }
      }
    );
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
            <textarea className="form-control" name="content" onChange={this.handleContentChange} value = {this.state.content} ></textarea>
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
          Login in as: <strong className="text-info">{this.state.user.email}</strong>, Current name in chat: <strong className="text-info">{auth().currentUser.displayName===null ? this.state.currentUserName : auth().currentUser.displayName}</strong>
        </div>
      </div>
    );
  }
}