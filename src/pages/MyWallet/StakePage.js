import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import Delegation from '../../components/stake/Delegation';
import { LockOpenOutline } from 'react-ionicons'
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
    function returnStakeInit() {
        if (stakeInit === null || stakeInit === undefined) {
            return (<div className='stake-status-event'>Loading...</div>)
        } else if (stakeInit === "initialized") {
            return (<div className='stake-status-event ssgr'>initialized</div>)
        } else {
            // orange one
            return ('NOT INITIALIZED')
        }
    }
    function returnDelegstatus() {
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
        } else {
            // placeholder for : Warmup & cooldown delegating ? active ? or should i use getStakeActivation
            return (<div className='stake-status-event ssor'>unknown</div>)
        }
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

        await connection.getParsedAccountInfo(stakekeypair.publicKey).then(function (result) {
            var getStakingType = result.value.data.parsed.type; //.data.parsed.type
            var getDelegationStatus = result.value.data.parsed.info.stake;
            //TODO: try to drastically reduces requests by : returning or callbacks or by splitting effect
            setstakeInit(getStakingType);
            setdelegStatus(getDelegationStatus);
            console.log("**getDelegationStatus : ", getDelegationStatus);
        });
    }

    useEffect(() => {
        getAllKeypairs();
        // getMainAccountKeypair();

    });

    async function tryToCreateStakeAccount() {
        var AuthSave = localStorage.getItem('auth-mnemonic')
        var MainSave = localStorage.getItem('mnemonic')
        var StakeSave = localStorage.getItem('stake-mnemonic')

        wCreateStakeAccount(MainSave, AuthSave, StakeSave)
            .then(function (val) {
                // you access the value from the promise here
                console.log("PLEASE RETURN A SIGNATURE ", val);
            });
        // return await 

    }
    // never returns actions if accounts are not loaded
    function displayCreateControl() {
        var AuthSave = localStorage.getItem('auth-mnemonic')
        var MainSave = localStorage.getItem('mnemonic')
        var StakeSave = localStorage.getItem('stake-mnemonic')
        if (AuthSave != null && MainSave != null && StakeSave != null) {

            // var accountkeypair = await wKeypair(isMainSaved); 
            //var authkeypair = await wKeypair(isAuthSaved); 

            return (
                <div className="card-button-center" onClick={() => { tryToCreateStakeAccount() }}>Create & Initialize</div>
            )
        }

    }

    function displayDelegationComponent() {
        if (delegStatus === undefined) {
            return (<div className='stake-status-event'>Loading...</div>)
        } else if (delegStatus === null) {
            return (
                <Delegation />
            )
        } else {
            // placeholder for : Warmup & cooldown delegating ? active ? or should i use getStakeActivation
            return (<div className='stake-status-event ssor'>unknown</div>)
        }
    }
    return (
        <div>
            <Title titleHeader='Stake' />
            <Card styleName='staking' cardContent={
                <div className='stake-address-wrapper'>
                    <div className='safe-logo'></div>
                    <div className='safe-balance-numbers'>
                        <div className="stake-address">{stakeAdd}</div>
                    </div>
                    <div className='stake-status'>
                        {returnStakeInit()}
                        <div className='horizontal-space'></div>
                        {returnDelegstatus()}
                    </div>
                    <div className='stake-numbers'>
                        <div className=''>Balance : <b>{stakebal / web.LAMPORTS_PER_SAFE}</b></div>
                        <div className=''>Delegated : <b>0</b></div>
                    </div>
                </div>
            } />
            {displayDelegationComponent()}
            <Card cardContent={
                <div>
                    <div className="card-subtitle">Authority address :</div>
                    <div className="receive-address">{authKp}</div>
                    {displayCreateControl()}
                </div>
            }>
            </Card>

        </div>
    );
}

export default StakePage;