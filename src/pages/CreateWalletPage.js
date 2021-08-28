import React from 'react';
import {
  generateMnemonicAndSeed,
  hasLockedMnemonicAndSeed,
  loadMnemonicAndSeed,
  mnemonicToSeed,
  storeMnemonicAndSeed,
  DERIVATION_PATH,
} from '../utils/wallet';
import {
  BrowserRouter as Router,
  Link
} from "react-router-dom";

import { genMnemonic, wgetPubKey } from '../utils/connection'
import NavCreateRestore from '../components/NavCreateRestore';
import { useState, useRef, useEffect } from 'react';

function CreateWalletPage(props) {

  const [mnemonicAndSeed, setMnemonicAndSeed] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  useEffect(() => {
    // generate mnemonic in hook, nothing stored
    generateMnemonicAndSeed().then(setMnemonicAndSeed);
  }, []);
  //const callAsync = useCallAsync();

  // fired on button v2

  function handleSubmit() {
    
    const { mnemonic, seed } = mnemonicAndSeed;
    storeMnemonicAndSeed(
      mnemonic,
      seed,
      password,
      DERIVATION_PATH.bip44Change,
    )
    console.log("mnemonic: ", mnemonic, "seed :", seed, "password : ", password, "derivatiob : ", DERIVATION_PATH.bip44Change)
  }




  // #region old way

  // if password null createUnencryptedAccount
  const [inputValue, setInputValue] = useState("");
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

  function handleCreateAccount(e) {
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
  // #endregion old way
  return (
    <div className="form-create-restore-wrap">
      <NavCreateRestore />
      <div className="form-create-restore">
        <label>Create wallet</label>
        <p>Your private keys are only stored on your current computer or device.</p>
        <textarea className="mntextarea" readOnly value={mn} ref={email}></textarea>
        <div className="btncontainer" onClick={handleClick}>
          <Link className="menu-nav-button mbtnactive" to="/mywallet"  > Create</Link>
        </div>
        <p>v2</p>
        {mnemonicAndSeed ? (
          <textarea className="mntextarea" readOnly value={mnemonicAndSeed.mnemonic} ref={email}></textarea>
        ) : (
          <textarea className="mntextarea" readOnly value="Generating mnemonics" ref={email}></textarea>
        )}
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}>
        </input>
        <input
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}>
        </input>
        {password === passwordConfirm ?
          <div className="btncontainer" onClick={handleSubmit}>
            <Link className="menu-nav-button mbtnactive" to="/mywallet"  > Create V2</Link>
          </div>
          : <></>}

      </div>
    </div>
  );
}

export default CreateWalletPage;