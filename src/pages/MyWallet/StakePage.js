import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import Popup from 'reactjs-popup';

//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import Delegation from '../../components/stake/Delegation';
import TransfertStatus from '../../components/transfert/TransfertStatus';

import { wCreateStakeAccount, wCreateAuthKeypair, wCreateStakeKeypair, wgetStakeActivation, wWithdrawStake } from '../../utils/stake';
import { wKeypair,wgetSignatureStatus } from '../../utils/connection'

import * as web from '@safecoin/web3.js';


const network = localStorage.getItem('network')
const connection = new web.Connection(network, "processed");
// TODO: clear inputs if confirmed status

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

    const [wgetStakeAmount, setwgetStakeAmount] = useState(null);
    const [wgetStakeStatus, setwgetStakeStatus] = useState(null);

    const [withdrwAmount, setwithdrwAmount] = useState(null);
    const [withdrwAddress, setwithdrwAddress] = useState(null);

    const [withDrwSignStatus, setwithDrwSignStatus] = useState(null);

    const [signature, setSignature] = useState(null);
    // placeholder for a more dynamic UI

    function returnDelegstatus() {
        // TOP CARD
        if (delegStatus === undefined) {
            return (<div className='stake-status-event'>Loading...</div>)
        } else if (stakeInit === "initialized") {
            return (<div className='ssgr'>initialized</div>)
        }
        else if (stakeInit === null && delegStatus === null) {
            return (
                <div className='ssor'>Not initialized</div>
            )
        } else if (stakeInit === "delegated") {
            // placeholder for : Warmup & cooldown delegating ? active ? or should i use getStakeActivation
            return (
                <div className='ssgr'>Delegated</div>
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
        //console.log("stakekeypair ", stakekeypair)
        //  getAuthkpPromiseEffect(authkeypair.publicKey.toBase58())
        var mainAddress = mainkeypair.publicKey.toBase58();
        var authAddress = authkeypair.publicKey.toBase58();
        var stakeAddress = stakekeypair.publicKey.toBase58();

        setaccAdd(mainAddress);
        setauthAdd(authAddress);
        setstakeAdd(stakeAddress);

        await connection.getBalance(stakekeypair.publicKey).then(function (result) {
            setstakebal(result);
        });

        await connection.getParsedAccountInfo(stakekeypair.publicKey)
            .then(function (result) {
                var getStakingType;
                try {
                    getStakingType = result.value.data.parsed.type;
                } catch (e) {
                    // FIXME: VERY DIRTY
                    getStakingType = null;
                }
                //.data.parsed.type
                var getDelegationStatus = result.value.data.parsed.info.stake;
                //TODO: try to drastically reduces requests by : returning or callbacks or by splitting effect
                setstakeInit(getStakingType);
                setdelegStatus(getDelegationStatus);
                console.log("*getParsedAccountInfo : ", result);
            }).catch((e) => {
                console.log("getParsedAccountInfo ", e)
            });
    }

    useEffect(() => {
        getAllKeypairs();

        wgetStakeActivation().then(function (result) {
            var activelamport = result.active;
            if (activelamport > 0 ) {
                setwgetStakeAmount(activelamport / web.LAMPORTS_PER_SAFE);
            }
            var inactivelamport = result.inactive;
            if (inactivelamport > 0 ) {
                setwgetStakeAmount(inactivelamport);
            }           
            setwgetStakeStatus(result.state);
            console.log("**wgetStakeActivation : ", result);

        }).catch((e) => {
            console.log("getParsedAccountInfo ", e)
            //constatus = false;
        });
        // getMainAccountKeypair();

    }, []);

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
    }
    // never returns actions if accounts are not loaded
    async function tryToWithdrawStake(amount, address) {
        setwithDrwSignStatus("request");
        wWithdrawStake(amount * web.LAMPORTS_PER_SAFE ,address)
        .then(function (signature) {
            // you access the value from the promise here
            //
            setwithDrwSignStatus("sent");
            setSignature(signature);
            console.log("tryToWithdrawStake signature: ", signature);
            wgetSignatureStatus(signature)
            .then(function (result) {
                console.log("SIGNATURE DETAILS", result)
                
                setwithDrwSignStatus("confirmed");
            })
            //console.log("SIGNATURE DETAILS", test)
        })
        .catch((e) => {
            console.log("**tryToWithdrawStake signature error: ", e)
          });
    }

    function returnSignStatWithdraw() {
        if (withDrwSignStatus === "request") {
            // loader
            return "request";
        } else if (withDrwSignStatus === "sent") {
            return "sent";
        } else if (withDrwSignStatus === "confirmed") {
            return "CONFIRMEDE";
        } 
    }

    function returnNetStakeBalance() {
        var balance;
        if (stakeInit === "delegated") {
            var rawbalance = stakebal / web.LAMPORTS_PER_SAFE;
            balance = rawbalance - (wgetStakeAmount / web.LAMPORTS_PER_SAFE);
            console.log("wgetStakeAmountwgetStakeAmount : ", wgetStakeAmount)
        } else {
            balance = stakebal / web.LAMPORTS_PER_SAFE;
        }
        return balance.toFixed(2);
    }

    function returnWithdrawStatus() {

        if (withDrwSignStatus === "confirmed") {

            return (
                <button
                className="card-button-center complete"
                >
                Sent !
                </button>
            )
        }

        if (withdrwAmount != null && withdrwAddress != null) {
            // display button unlock
            return (
                <button
                className="card-button-center"
                onClick={() => { tryToWithdrawStake(withdrwAmount, withdrwAddress);} }>
                Withdraw
                </button>
            )
        } else {
            return (
                <button className="card-button-center disabled">
                Withdraw
                </button>
            )
        }
    }
    const onChangeHandlerAddress = event => {
        setwithdrwAddress(event.target.value);
    };

    const onChangeHandlerAmount = event => {
        setwithdrwAmount(event.target.value);
    };
    
    function displayTransfertStatusComponent() {

        return (
            <div>
                <TransfertStatus status={withDrwSignStatus} sign={signature} />
               
            </div>
        )

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
                <div>
                    <Delegation 
                    status={"DELEGATED"} 
                    balance={stakebal / web.LAMPORTS_PER_SAFE}
                    delegatedAmount={wgetStakeAmount.toFixed(2) * web.LAMPORTS_PER_SAFE}
                    delegatedStatus={wgetStakeStatus}
                    />
                    <div className="just-flex">
                        <Popup
                            trigger={<div className="card-button-center" >Withdraw</div>}
                            modal
                            nested
                        >
                            {close => (
                                <div className="modal">
                                    <button className="close" onClick={close}>
                                        &times;
                                    </button>
                                    {/* <div className="header"> Withdraw from atake account </div> */}
                                    <div className="header-form">
                                        <div className="stake-withdraw-avaiable">Balance : { returnNetStakeBalance()}</div>
                                    </div>
                                    <div className="content">
                                        <div className="text-form-withdraw">
                                            {' '}
                                           Please note that you can't directly withdraw delegated stake, <i>you have to desactivate it first</i>.
                                        </div>
                                        <br />
                                        <div className="label-stake-withdraw">Amount</div>
                                        <input type="number" max={returnNetStakeBalance()} placeholder="0.00" className="input-amount-form" onChange={onChangeHandlerAmount} />
                                        <div className="label-stake-withdraw">Recipient</div>
                                        <input placeholder="Address" className="input-address-form" onChange={onChangeHandlerAddress} />
                                    </div>
                                    {displayTransfertStatusComponent()}
                                    {/* Display future Transfert Component here */}
                                    <div className="actions">
                                        
                                        {returnWithdrawStatus()}
                                       
                                    </div>
                                </div>
                            )}
                        </Popup>

                        <div className="card-button-center" onClick={() => { }}>Desactivate</div>
                    </div>

                </div>
            )
        } else {

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
                        <div className="stake-auth">
                            <div className="stake-sauth-label">S-AUTH</div>
                            <div className="stake-subadd">{authKp}</div>
                        </div>
                        <div className="stake-auth">
                            <div className="stake-sauth-label">W-AUTH</div>
                            <div className="stake-subadd">{authKp}</div>
                        </div>
                    </div>
                    <div className='stake-status'>
                        <div className="auth-container">

                        </div>
                        <div className='horizontal-space'></div>
                        {/* to rework*/}

                    </div>
                    <div className='stake-numbers'>
                        <div className='stake-numb-grid'>Balance : <b>{returnNetStakeBalance()}</b></div>
                        <div className='stake-numb-grid'>Status : <b>{returnDelegstatus()}</b></div>
                    </div>
                </div>
            } />
            {displayDelegationComponent()}
        </div>
    );
}

export default StakePage;