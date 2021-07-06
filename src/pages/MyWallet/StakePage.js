import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';

import {wCreateStakeAccount , wCreateAuthKeypair} from '../../utils/stake';
import { wKeypair} from '../../utils/connection'
import * as web from '@safecoin/web3.js';
const network = localStorage.getItem('network')
const connection = new web.Connection(network, "processed");
function StakePage(props) {

    const [authKp, setauthKp] = useState(null);
    const [authbal, setauthbal] = useState(null);
    async function getAuthKeypair() {

        var isSaved = localStorage.getItem('auth-mnemonic')
        if (isSaved == null || isSaved === undefined) {
            wCreateAuthKeypair();
        } 
        var mnauth = localStorage.getItem('auth-mnemonic')
        var authkeypair = await wKeypair(mnauth); // don't forget to right click on wKeypair > Go to definition for more
          //  getAuthkpPromiseEffect(authkeypair.publicKey.toBase58())
        var  authpeubkey = authkeypair.publicKey.toBase58();
        
        setauthKp(authpeubkey);
        var getbalance = await connection.getBalance(authkeypair.publicKey);
        
        await connection.requestAirdrop(authkeypair.publicKey, 2 * web.LAMPORTS_PER_SAFE)
        .then( 
            function(TransactionSignature)
            { 
                console.log("requestAirdrop: "+ TransactionSignature); 
               setauthbal(getbalance);
               // return TransactionSignature;
            })
        .catch((e)=>{console.log("error",e)});

        
        console.log("Auth keypair : ", authkeypair);
        console.log("authpeubkey : ", authpeubkey);
        console.log("isSaved : ", isSaved);

    }
    useEffect(() => {
        getAuthKeypair();

    });

    return (
        <div>
            <Title titleHeader='Stake'/>
            <Card cardContent={
                <div>
                    <div>Authority address :</div>
                    <div>{authKp}</div>
                    <div>{authbal}</div>
                    <button onClick={wCreateStakeAccount}>Create & delegate</button>
                </div>
            }>
            </Card>
      </div>
    );
   }

export default StakePage;