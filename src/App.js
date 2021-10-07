import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route, Redirect
} from "react-router-dom";
import CreateWalletPage from './pages/CreateWalletPage';
import RestoreWalletPage from './pages/RestoreWalletPage';
import MainWalletPage from './pages/MainWalletPage';
import MaintenancePage from './pages/MaintenancePage';
import { isApiAlive } from './utils/connection';
import { useState } from 'react';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"

///// TODO: HERE
// Mobile condition component
// encrypt more + seed passwd

// if true disable CreateWalletPage & RestoreWalletPage
function isSaved() {
  var getsave = localStorage.getItem('mnemonic');
  if (getsave == null) { getsave = false }
  else { getsave = true }
  return getsave;
}

function App() {
  const [apiStatus, setApisStatus] = useState(true);
  const [saveStatus, setSaveStatus] = useState(true);
  localStorage.setItem('network', "https://api.mainnet-beta.safecoin.org")
  async function sendApiStatusPromiseEffect() {
    const apisstatus = await isApiAlive();
    setApisStatus(apisstatus);
  }
  function sendIsSavedEffect() {
    var issSaved = isSaved();
    setSaveStatus(issSaved);
  }
  useEffect(() => {
    sendApiStatusPromiseEffect();
  });
  useEffect(() => {
    sendIsSavedEffect();
  });



  
  //console.log("saveStatus ", saveStatus);

  if (apiStatus === true) {
    if (saveStatus === false) {
      // if mobile >>> display mobile classes
      //console.log('App Checkconn true', apiStatus)
      return (
        <div className="App">
          <Router>
            <Redirect to='/' />
            <div>
              <Switch>
                <Route exact path="/">
                  <CreateWalletPage />
                </Route>
                <Route exact path="/maintenance">
                  <MaintenancePage />
                </Route>
                <Route path="/restore">
                  <RestoreWalletPage />
                </Route>
                <Route path="/mywallet">
                  <MainWalletPage />
                </Route>
              </Switch>
            </div>
          </Router>
        </div>
      );
    } else {
      return (
        <div className="App">
          <ToastContainer limit={1} />
          {/* Wallet action navigation */}
          <Router>
            {/* Page Content will be displayed here */}
            <Redirect to='/mywallet' />
            <Route path="/mywallet">
              <MainWalletPage />
            </Route>
          </Router>
        </div>
      )
    }
  }
  else {
    //console.log('App Checkconn false ',);
    return (
      <MaintenancePage />
    );
  }
}

export default App;
