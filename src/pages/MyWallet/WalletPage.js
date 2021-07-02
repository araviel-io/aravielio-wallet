import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import safelogo from '../../assets/img/safecoin-logo.png';

import { wngetSafePrice }  from '../../utils/nomics';
import { wgetBalance, solRequestAirdrop } from '../../utils/connection';

///// TODO: HERE
// first mnemonic word
// token listing
/////


function WalletPage(props) {

 
  //  const { safelam } = wgetBalance(mnemonic);
  const mnemonic = localStorage.getItem('mnemonic')
  const network = localStorage.getItem('network')
//console.log("GET ITEM MNEMONIC", mnemonic)
    //safecoin cluster query state
  const [balance, setBalance] = useState(0);
  // nomics query
  const [safeprice, setsafeprice] = useState(0);


  function checkDevnet() {
    
    if (network === 'https://api.devnet.solana.com') {
        console.log("NETWORKLOL ", network)
        return (

        <button onClick={solRequestAirdrop}>Request Airdrop</button>
        
        );
    }
    
}


  async function balancePromiseEffect() {
    const response = await wgetBalance(mnemonic);
    //const nomreponse = await wngetSafePrice();

   // console.log("SAFE PRICE FROM WALLET :", safeprice)
    setBalance(response);
   // setsafeprice(nomreponse);
  }

  useEffect(() => {
    balancePromiseEffect();

  });
  useEffect(() => {
    
    safenomPromiseEffect();
  });
  async function safenomPromiseEffect() {
   
    var nomreponse = await wngetSafePrice();

    
    console.log("SAFE safeprice :", safeprice)
    setsafeprice(nomreponse);
    console.log("SAFE PRICE FROM WALLET :", nomreponse)
  }

function returnBalance () {
    if (balance == null) {
        return ( 'Loading balance')
    } else if ( balance === 0 ){
        return ( '0')
    } else {
        return ( balance)
    }   
}
function returnSafePrice() {
    if (safeprice == null) {
        return ( 'Loading price')
    } else {

        var test = safeprice * balance;
        var trunc = test.toFixed(2)
        return ( trunc)
    }
}
    return (
        <div>
            <Title titleHeader='Wallet'/>
            <Card styleName='safecoin' cardContent={
                <div className='safe-balance-wrapper'>
                    <div className='safe-logo'><img className="menu-logo" src={safelogo} alt="Araviel.io Wallet" /></div>
                    <div className='safe-balance-numbers'>
                    {checkDevnet()}
                        <div className='safe-usd'> $ 
                        {returnSafePrice()}
                        </div>
                        <div className='safe-amount'>{returnBalance()} SAFE</div>       
                    </div>
                </div>
            }/>
            <Title titleHeader='Tokens' />
            <Card cardContent={
                <div className='safe-balance-wrapper'>
                    <div>No Tokens found</div>
                </div>
            }/>
        </div>
    );
   }

export default WalletPage;