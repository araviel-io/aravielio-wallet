import React from 'react';
import {  wgetPubKey } from '../utils/connection'
import NavCreateRestore from '../components/NavCreateRestore';
import { Link } from 'react-router-dom';
import { useState } from 'react';
// TODO: Full restore : main, authority, stake
function WordCount(str) {
  return str.split(' ')
         .filter(function(n) { return n != '' })
         .length;
}

// get pubkey from decoded mnemonic
async function registerPubkey(mnemonic) {
  const response = await wgetPubKey(mnemonic);
  localStorage.setItem('pubkey', response);
}
// check if mnemonic provided is 24 words
function validateMnemonic(mnemonic) {
    if (WordCount(mnemonic) === 24 ) {
      registerPubkey(mnemonic);
      localStorage.setItem('mnemonic', mnemonic);
      return <Link className="menu-nav-button mbtnactive" to="/mywallet"> Restore</Link>;
    } else {
      return <p>12 or 24 words</p>;
    }
}

function RestoreWalletPage(props) {
  const [inputValue, setInputValue] = useState("");
  console.log("inputValue ", inputValue)
 


  const onChangeHandler = event => {
    setInputValue(event.target.value);
  //  validateMnemonic(inputValue);
    console.log("event.target.value ", event.target.value)
    console.log("inputValue ", inputValue)
  };
    return (
      <div className="form-create-restore-wrap">
        <NavCreateRestore/>
        <div className="form-create-restore">
          <label>Restore an existing wallet</label>
          <p>Your private keys are only stored on your current computer or device. You will need these words to restore your wallet if your browser’s storage is cleared or your device is damaged or lost.</p>
          <p>Compliant to wallet.safecoin.org derivation (derivation)</p>   
            <textarea className="mntextarea" onChange={onChangeHandler} value={inputValue} rows="5" cols="33"></textarea>
            <div className="btncontainer">{validateMnemonic(inputValue)}</div>
            
        </div>
     
      </div>
    );
   }

export default RestoreWalletPage;