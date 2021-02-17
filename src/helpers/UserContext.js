import React, { useEffect, useState } from "react";
import { auth } from "../services/firebase";

export const UserContext = React.createContext();

export const UserProvider = ({children}) => {


  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    auth().onAuthStateChanged((user) => {
    setCurrentUser(user);
    });
  }, []);

  return <UserContext.Provider value={currentUser}>{children}</UserContext.Provider>;

}