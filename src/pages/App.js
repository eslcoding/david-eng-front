import React from "react";
import "../App.css";
import "monday-ui-react-core/dist/main.css"
import Home from "./Home";
//Explore more Monday React Components here: https://style.monday.com/
class App extends React.Component {

  // Default state
  state = {

  };


  async componentDidMount() {


  }



  render() {
    return (

        <div className="main-container">
          {/* <header className="main-header">Hello!</header> */}
          <Home/>
        </div>
    )
  }
}

export default App;
