import React from 'react';

import {
    BrowserRouter as Router,
    Link
  } from "react-router-dom";

import {  genMnemonic, wgetPubKey } from '../utils/connection'
import NavCreateRestore from '../components/NavCreateRestore';
import { useState } from 'react';
import { useRef } from 'react';

function validateMnemonic(mnemonic) {
  //console.log("validateMNEMONIC", WordCount(mnemonic));
  
      return <Link className="menu-nav-button mbtnactive" to="/mywallet"> Restore</Link>;
}



function CreateWalletPage(props) {

  const [inputValue, setInputValue] = useState("");
  // console.log("inputValue ", inputValue)
  // localStorage.setItem('mnemonic', inputValue);
  const mn = genMnemonic();
  const email = useRef(null);
    function handleClick(e) {
      e.preventDefault();
      setInputValue(email.current.value);
      //  validateMnemonic(inputValue);
      localStorage.setItem('mnemonic', email.current.value);
     

      async function balancePromiseEffect() {
        const response = await wgetPubKey(email.current.value);
        localStorage.setItem('pubkey', response);
       
      }
    
     
        balancePromiseEffect();
     



      // history.push("/mywallet");
      console.log("inputValue ", inputValue)
      console.log("localstorage get", localStorage.getItem('pubkey'))
      // console.log("inputValue ", inputValue)
    };


    return (
      <div className="form-create-restore-wrap">
        <NavCreateRestore/>
        <div className="form-create-restore">
          <label>Create wallet</label>
          <p>Your private keys are only stored on your current computer or device. You will need these words to restore your wallet if your browser’s storage is cleared or your device is damaged or lost.</p>
          <p>Compliant to wallet.safecoin.org derivation (derivation)</p> 
            <textarea className="mntextarea" readOnly value={mn} ref={email}></textarea>
            <div className="btncontainer"onClick={handleClick}>
              <Link className="menu-nav-button mbtnactive" to="/mywallet"  > Create</Link>
            </div>
            
        </div>
     
      </div>
    );
   }

export default CreateWalletPage;