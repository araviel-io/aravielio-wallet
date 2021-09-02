import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { loadMnemonicAndSeed } from '../utils/wallet';
import {
    BrowserRouter as Router,
    Link
  } from "react-router-dom";
// this page will be only displayed if the 'locked' localstorage key is present
function LoginPage(props: any) {
    const [password, setPassword] = useState('');
    const [stayLoggedIn, setStayLoggedIn] = useState(false);
    // #endregion old way
    function submitUnlocking(){
        loadMnemonicAndSeed(password, stayLoggedIn)
    }

    return (
        <div className="form-create-restore-wrap">
            <input
                
                onChange={(e) => setPassword(e.target.value)}>
            </input>
            <input type="checkbox" id="subscribeNews" name="subscribe" value="newsletter" onChange={(e) => setStayLoggedIn(e.target.checked)}></input>

            <div className="btncontainer" onClick={submitUnlocking}>
                {/* PASS THE PASSWORD TO A PROPS > MainWAlletPage and redistribute it between components*/ }
                <Link className="menu-nav-button mbtnactive" to="/mywallet"  > lOGIN</Link>
            </div>
        </div>
    );
}

export default LoginPage;