import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import Delegation from '../../components/stake/Delegation';
import { LockOpenOutline,LockClosedOutline  } from 'react-ionicons'
import { wCreateStakeAccount, wCreateAuthKeypair, wCreateStakeKeypair, wgetParsedAccountInfo } from '../../utils/stake';
import { wKeypair } from '../../utils/connection'
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
    const [stakeInit, setstakeInit] = useState(null);
    const [delegStatus, setdelegStatus] = useState(null);

    // placeholder for a more dynamic UI

    function returnDelegstatus() {
    // TOP CARD
        if (delegStatus === undefined) {
            return (<div className='stake-status-event'>Loading...</div>)
        } else if (delegStatus === null) {
            return (
                <div className='stake-status-event ssor'>
                    <div className="icon-container">
                        <LockOpenOutline color={'#00000'} height="16px" width="16px" />
                    </div>
                    Not delegated
                </div>)
        } else if (stakeInit === "initialized") {
            return (<div className='stake-status-event ssgr'>initialized</div>)
        } else if (stakeInit === "delegated") {
            // placeholder for : Warmup & cooldown delegating ? active ? or should i use getStakeActivation
            return (
                <div className='stake-status-event ssgr'>
                    <div className="icon-container">
                        <LockClosedOutline color={'#00000'} height="16px" width="16px" />
                    </div>
                    Delegated
                </div>
            )
        } //<div className='stake-status-event ssgr'>Delegated</div>
    }
    async function getAllKeypairs() {

        var mnMain = localStorage.getItem('mnemonic')
        var mnAuth = localStorage.getItem('auth-mnemonic')
        var mnStake = localStorage.getItem('stake-mnemonic')

        // var stakestatus = await wgetParsedAccountInfo(mnStake);
        // console.log("stake status : ", stakestatus)
        if (mnAuth == null || mnAuth === undefined) { wCreateAuthKeypair(); }
        if (mnStake == null || mnStake === undefined) { wCreateStakeKeypair(); }

        //var mnauth = localStorage.getItem('auth-mnemonic')
        var mainkeypair = await wKeypair(mnMain);
        var authkeypair = await wKeypair(mnAuth); // don't forget to right click on wKeypair > Go to definition for more
        var stakekeypair = await wKeypair(mnStake);
        console.log("stakekeypair ", stakekeypair)
        //  getAuthkpPromiseEffect(authkeypair.publicKey.toBase58())
        var mainAddress = mainkeypair.publicKey.toBase58();
        var authAddress = authkeypair.publicKey.toBase58();
        var stakeAddress = stakekeypair.publicKey.toBase58();

        setaccAdd(mainAddress);
        setauthAdd(authAddress);
        setstakeAdd(stakeAddress);

        await connection.getBalance(mainkeypair.publicKey).then(function (result) {
            setaccbal(result);
        });

        await connection.getBalance(authkeypair.publicKey).then(function (result) {
            setauthbal(result);
        });

        await connection.getBalance(stakekeypair.publicKey).then(function (result) {
            setstakebal(result);
        });

        await connection.getParsedAccountInfo(stakekeypair.publicKey)
        .then(function (result) {
            var getStakingType;
            try {
                getStakingType = result.value.data.parsed.type;
            } catch(e) {
                // FIXME: VERY DIRTY
                getStakingType = null;
            }
             //.data.parsed.type
            var getDelegationStatus = result.value.data.parsed.info.stake;
            //TODO: try to drastically reduces requests by : returning or callbacks or by splitting effect
            setstakeInit(getStakingType);
            setdelegStatus(getDelegationStatus);
            console.log("*getParsedAccountInfo : ", result);
           /* console.log("**getDelegationStatus : ", getDelegationStatus);
            console.log("**getStakingType : ", getStakingType);
            console.log("** stakekeypair.publicKey.toBase58() : ", stakekeypair.publicKey.toBase58());*/
        }).catch((e) => {
            console.log("getParsedAccountInfo ", e)
            //constatus = false;
        });
    }

    useEffect(() => {
        getAllKeypairs();
        // getMainAccountKeypair();

    },[]);

    async function tryToCreateStakeAccount() {
        var AuthSave = localStorage.getItem('auth-mnemonic')
        var MainSave = localStorage.getItem('mnemonic')
        var StakeSave = localStorage.getItem('stake-mnemonic')

        wCreateStakeAccount(MainSave, AuthSave, StakeSave)
            .then(function (val) {
                if (val != null) {
                    setstakeInit("initialized");
                }
                // you access the value from the promise here
                console.log("PLEASE RETURN A SIGNATURE ", val);
            });
        // return await 

    }
    // never returns actions if accounts are not loaded
    function displayCreateControl() {


    }

    function displayDelegationComponent() {
        var AuthSave = localStorage.getItem('auth-mnemonic')
        var MainSave = localStorage.getItem('mnemonic')
        var StakeSave = localStorage.getItem('stake-mnemonic')
        console.log("stakeinitstakeinit : ", stakeInit)
        if (stakeInit === null || stakeInit === undefined) {
            // placeholder for : Warmup & cooldown delegating ? active ? or should i use getStakeActivation
         
            if (AuthSave != null && MainSave != null && StakeSave != null) {
                // var accountkeypair = await wKeypair(isMainSaved); 
                //var authkeypair = await wKeypair(isAuthSaved); 
                return (
                    <div>
                        <Delegation status={null} balance={stakebal / web.LAMPORTS_PER_SAFE} />
                        <div className="card-button-center" onClick={() => { tryToCreateStakeAccount() }}>Initialize</div>
                    </div>
                )
            }
        } else if (delegStatus === null && stakeInit === "initialized") {
            // means initialized & not delegated FIXME: more intuitive conditions
            return (
                <div>
                    
                    <Delegation status={"INITIALIZED"} balance={stakebal / web.LAMPORTS_PER_SAFE} />
                </div>
            )
        } else if (stakeInit === "delegated") {
            // no controls show delegation component with stake data
            return (
                <Delegation status={"DELEGATED"} balance={stakebal / web.LAMPORTS_PER_SAFE} />
            )
        } else {

        }

    }
    return (
        <div>
            <Title titleHeader='Stake' />
            <Card styleName='staking' cardContent={
                
                <div className='stake-address-wrapper'>
                    <div className="dark-card-heading">Staking account</div>
                    <div className='safe-logo'></div>
                    <div className='safe-balance-numbers'>
                        <div className="stake-address">{stakeAdd}</div>
                    </div>
                    <div className='stake-status'>
                        <div className="auth-container">

                        </div>
                        <div className='horizontal-space'></div>
                        {/* to rework*/}
                        {returnDelegstatus()}
                    </div>
                    <div className='stake-numbers'>
                        <div className=''>Balance : <b>{stakebal / web.LAMPORTS_PER_SAFE}</b></div>
                        <div className=''>Delegated : <b>0</b></div>
                    </div>
                </div>
            } />
            {displayDelegationComponent()}
        </div>
    );
}

export default StakePage;