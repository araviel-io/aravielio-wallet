import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';

import {wCreateStakeAccount , wCreateAuthKeypair, wCreateStakeKeypair} from '../../utils/stake';
import { wKeypair} from '../../utils/connection'
import * as web from '@safecoin/web3.js';

const network = localStorage.getItem('network')
const connection = new web.Connection(network, "processed");

function StakePage(props) {

    // never use those hooks for sending transactions, except if you know what you
    // are doing (callbacks)
    const [accAdd, setaccAdd] = useState(null);
    const [accbal, setaccbal] = useState(null);

    const [authKp, setauthAdd] = useState(null);
    const [authbal, setauthbal] = useState(null);

    const [stakeAdd, setstakeAdd] = useState(null);
    const [stakebal, setstakebal] = useState(null);

    async function getAllKeypairs() {

        var mnMain = localStorage.getItem('mnemonic')
        var mnAuth = localStorage.getItem('auth-mnemonic')
        var mnStake = localStorage.getItem('stake-mnemonic')
        if (mnAuth == null || mnAuth === undefined) {wCreateAuthKeypair();} 
        if (mnStake == null || mnStake === undefined) {wCreateStakeKeypair();} 

        //var mnauth = localStorage.getItem('auth-mnemonic')
        var mainkeypair = await wKeypair(mnMain);
        var authkeypair = await wKeypair(mnAuth); // don't forget to right click on wKeypair > Go to definition for more
        var stakekeypair = await wKeypair(mnStake);
          //  getAuthkpPromiseEffect(authkeypair.publicKey.toBase58())
        var mainAddress = mainkeypair.publicKey.toBase58();
        var authAddress = authkeypair.publicKey.toBase58();
        var stakeAddress = stakekeypair.publicKey.toBase58();

        setaccAdd(mainAddress);
        setauthAdd(authAddress);
        setstakeAdd(stakeAddress);
/*
// TODO: replace getbalance by getaccountifo and hook data
        await connection.getAccountInfo(mainkeypair.publicKey).then(function(result){ 
            console.log("getAccountInfo mainkeypair : ", result); 
           // setaccbal(result);
        });
*/
        await connection.getBalance(mainkeypair.publicKey).then(function(result){ 
           // console.log("requestAirdrop: "+ result); 
            setaccbal(result);
        });

        await connection.getBalance(authkeypair.publicKey).then(function(result){ 
           // console.log("requestAirdrop: "+ result); 
            setauthbal(result);
        });
        await connection.getBalance(stakekeypair.publicKey).then(function(result){ 
           // console.log("requestAirdrop: "+ result); 
            setstakebal(result);
        });
        
        await connection.requestAirdrop(authkeypair.publicKey, 2 * web.LAMPORTS_PER_SAFE)
        .then( 
            function(airdropResult)
            { 
                console.log("requestAirdrop: ", airdropResult); 
            })
        .catch((e)=>{console.log("error",e)});
    }

    useEffect(() => {
        getAllKeypairs();
       // getMainAccountKeypair();

    });

    // never returns actions if accounts are not loaded
    function displayCreateControl() {
        var AuthSave = localStorage.getItem('auth-mnemonic')
        var MainSave = localStorage.getItem('mnemonic')
        var StakeSave = localStorage.getItem('stake-mnemonic')
        if (AuthSave != null && MainSave != null && StakeSave != null)
        {

           // var accountkeypair = await wKeypair(isMainSaved); 
            //var authkeypair = await wKeypair(isAuthSaved); 

            return (  
                <div className="card-button-center" onClick={() => {wCreateStakeAccount(MainSave, AuthSave, StakeSave)} }>Initialize</div>
            )
        }

    }

    return (
        <div>
            <Title titleHeader='Stake'/>
            <Card cardContent={
                <div>
                    <div className="card-subtitle">Main address :</div>
                    <div className="receive-address">{accAdd}</div>
                    <div className="stake-account-infos">
                        <div>Balance : </div>
                        <div><b>{accbal / web.LAMPORTS_PER_SAFE}</b></div>
                        <div className="account-owner">Owner :</div>
                    </div>
                    
                    <div className="card-subtitle">Authority address :</div>
                    <div className="receive-address">{authKp}</div>
                    <div className="stake-account-infos">
                        <div>Balance : </div>
                        <div><b>{authbal / web.LAMPORTS_PER_SAFE}</b></div>
                        <div className="account-owner">Owner :</div>
                    </div>
                    
                    <div className="card-subtitle">Stake address :</div>
                    <div className="receive-address">{stakeAdd}</div>
                    <div className="stake-account-infos">
                        <div>Balance : </div>
                        <div><b>{stakebal / web.LAMPORTS_PER_SAFE}</b></div>
                        <div className="account-owner">Owner :</div>
                    </div>
                    
                  { displayCreateControl()}
                </div>
            }>
            </Card>
      </div>
    );
   }

export default StakePage;