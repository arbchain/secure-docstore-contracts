import React, {Component} from "react";
import { useHistory } from "react-router-dom";
import Header from "./Header";


export default function Layout({ children }) {

    let history = useHistory()

    return (

    ['/login', '/signup'].includes(history.location.pathname) ?
        null :
      <div>
          <Header/>
          <div>
          { children }
         </div>
    </div>
    )
}