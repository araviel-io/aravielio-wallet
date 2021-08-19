import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

import logo from '../assets/img/logo.png';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import ReceivePage from './MyWallet/ReceivePage';
import WalletPage from './MyWallet/WalletPage';
import WalletMenu from '../components/WalletMenu';
import SendPage from './MyWallet/SendPage';
import StakePage from './MyWallet/StakePage';
import SettingsPage from './MyWallet/SettingsPage';

import { wgetVersion } from '../utils/connection'

function MainWalletPage(props) {
  const [version, setVersion] = useState("");
  const whichpage = localStorage.getItem("page");

  useEffect(() => {
    if (localStorage.hasOwnProperty("mnemonic")) {
      wgetVersion()
        .then(
          function (result) {
            setVersion(result['solana-core']);
          })
        .catch((e) => { console.log("version error", e) });
        
    }
  }, [version])
  
  function selectedNetwork() {
    // console.log("NETWORKLOL ", network)
    const network = localStorage.getItem('network')
    if (network === 'https://api.devnet.solana.com') { return (<div>{' '}<b>Solana devnet</b><br />ver. {version}</div>) }
    else if (network === 'https://api.mainnet-beta.safecoin.org') { return (<div>{' '}<b>Safe mainnet</b><br />ver. {version}</div>) }

  }

  return (
    <div className="WrapperWallet">
      <Router>
        <div className="menu-container">
          <div className="menu-actual-network">{selectedNetwork()}</div>
          <div className="menu-logo-container">
            <img className="menu-logo" src={logo} alt="Araviel.io Wallet" />
          </div>
          <WalletMenu />
        </div>
        <div className="page-container">

          {/* Page Content will be displayed here */}
          <Switch>
            <Route exact path="/mywallet">
              <WalletPage />
            </Route>
            <Route path="/mywallet/receive">
              <ReceivePage />
            </Route>

            <Route path="/mywallet/send">
              <SendPage />
            </Route>
            <Route path="/mywallet/stake">
              <StakePage />
            </Route>
            <Route path="/mywallet/settings">
              <SettingsPage />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default MainWalletPage;