import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import Popup from 'reactjs-popup';
import { CoffeeLoading } from 'react-loadingg';
import { ListOutline } from 'react-ionicons'
import { RangeStepInput } from 'react-range-step-input';
//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import Delegation from '../../components/stake/Delegation';

import { wCreateStakeAccount, wCreateStakeKeypair, wgetStakeActivation, wWithdrawStake } from '../../utils/stake';
import { wKeypair, wgetSignatureStatus, wgetMiniRent, wgetSignatureConfirmation } from '../../utils/connection'

import * as web from '@safecoin/web3.js';

const network = localStorage.getItem('network')
const connection = new web.Connection(network, "processed");
// TODO: clear inputs if confirmed status
// TODO: delegated validator info (picture from keybase, better sub-card)
//TODO: reward tab
function StakePage(props) {

    const [authKp, setauthAdd] = useState(null);

    const [stakeAdd, setstakeAdd] = useState(null);
    const [stakebal, setstakebal] = useState(null);
    const [stakeInit, setstakeInit] = useState(null);

    const [loadstakeInit, setloadstakeInit] = useState(null);

    const [delegStatus, setdelegStatus] = useState(null);

    const [wgetStakeAmount, setwgetStakeAmount] = useState(null);
    const [wgetStakeStatus, setwgetStakeStatus] = useState(null);

    const [withdrwAmount, setwithdrwAmount] = useState("");
    const [withdrwAddress, setwithdrwAddress] = useState(null);

    const [withDrwSignStatus, setwithDrwSignStatus] = useState(null);
    // DisplayContactOrAddressI > "address" if defualt
    const [ContactOrAddress, setContactOrAddress] = useState("address");

    // const [signature, setSignature] = useState(null);
    // const [rent, setRent] = useState(null);
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
            return (
                <div className='ssgr'>{wgetStakeStatus}</div>
            )
        }
    }
    async function getAllKeypairs() {

        var mnMain = localStorage.getItem('mnemonic')
        // var mnAuth = localStorage.getItem('auth-mnemonic')
        var mnStake = localStorage.getItem('stake-mnemonic')

        if (mnStake == null || mnStake === undefined) { wCreateStakeKeypair(); }

        //var mnauth = localStorage.getItem('auth-mnemonic')
        var mainkeypair = await wKeypair(mnMain);
        //var authkeypair = await wKeypair(mnAuth); // don't forget to right click on wKeypair > Go to definition for more
        var stakekeypair = await wKeypair(mnStake);
        //console.log("stakekeypair ", stakekeypair)
        //  getAuthkpPromiseEffect(authkeypair.publicKey.toBase58())
        var mainAddress = mainkeypair.publicKey.toBase58();
        //var authAddress = authkeypair.publicKey.toBase58();
        var stakeAddress = stakekeypair.publicKey.toBase58();

        //setaccAdd(mainAddress);
        setauthAdd(mainAddress);
        setstakeAdd(stakeAddress);

        await connection.getBalance(stakekeypair.publicKey).then(function (result) {
            setstakebal(result);
        });

        await connection.getParsedAccountInfo(stakekeypair.publicKey)
            .then(function (result) {
                console.log("StakePage.js - getParsedAccountInfo(stakekeypair.publicKey) ", result)
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
                console.log("StakePage.js -  setstakeInit(getStakingType); ", getStakingType)
                setdelegStatus(getDelegationStatus);
                console.log("*getParsedAccountInfo : ", result);
            }).catch((e) => {
                console.log("getParsedAccountInfo ex", e)
            });
    }

    useEffect(() => {
        getAllKeypairs();
        console.log("   ddd d   stakeInitstakeInit", stakeInit)
        if (stakeInit !== null) {
            console.log("stakeInitstakeInit", stakeInit)
            wgetStakeActivation().then(function (result) {
                console.log("StakePage.js - RESULT GALERE", result)
                var activelamport = result.active;
                if (activelamport > 0) {
                    setwgetStakeAmount(activelamport / web.LAMPORTS_PER_SAFE);
                }
                var inactivelamport = result.inactive;
                if (inactivelamport > 0) {
                    setwgetStakeAmount(inactivelamport / web.LAMPORTS_PER_SAFE);
                }
                setwgetStakeStatus(result.state);


            }).catch((e) => {
                console.log("StakePage - wgetStakeActivation Promise ", e)
                //constatus = false;
            });
            // getMainAccountKeypair();
        } else {

            wgetMiniRent()
                .then(function (result) {
                    //setRent(result);
                    console.log(result)
                }).catch((e) => {
                    console.log("StakePage - wgetStakeActivation Promise ", e)
                    //constatus = false;
                });
        }


    }, [stakeInit]);

    async function tryToCreateStakeAccount() {
        setloadstakeInit("sent")
        //var AuthSave = localStorage.getItem('auth-mnemonic')
        var MainSave = localStorage.getItem('mnemonic')
        var StakeSave = localStorage.getItem('stake-mnemonic')

        wCreateStakeAccount(MainSave, StakeSave)
            .then(function (val) {
                if (val != null) {
                    setstakeInit("initialized");
                    setloadstakeInit("complete")

                }
                // you access the value from the promise here
                //console.log("PLEASE RETURN A SIGNATURE ", val);
            });
    }
    // never returns actions if accounts are not loaded
    async function tryToWithdrawStake(amount, address) {
        setwithDrwSignStatus("requesting");

        wWithdrawStake(amount * web.LAMPORTS_PER_SAFE, address)
            .then(function (signature) {
                // you access the value from the promise here
                //
                setwithDrwSignStatus("sent");
                // setSignature(signature);
                //console.log("tryToWithdrawStake signature: ", signature);

                wgetSignatureStatus(signature)
                    .then(function (result) {

                        console.log("NOW : wgetSignatureStatus(signature)", result)
                        if (result.value.err === null) {
                            setwithDrwSignStatus("confirmed");
                            //TODO: update balance
                        } else {
                            setwithDrwSignStatus(result.value.err.InstructionError[1]);
                        }
                        // TODO: parse result to check the transaction status
                        // clear input field after confirm or error

                        setwithdrwAmount(0);
                    })
                    .catch((e) => {
                        console.log("*---- getSignatureStatus(signature) : ", e)
                    });
                //console.log("SIGNATURE DETAILS", test)
            })
            .catch((e) => {
                console.log("**tryToWithdrawStake ERROR FROM STAKEPAGE : ", e)
            });
    }

    //console.log('%c StakePage.js recUnConfAmount : ', 'background: red; color: #bada55', recUnConfAmount)
    //console.log(recUnConfAmount)
    function returnStakeInitLoading() {
        if (loadstakeInit === "sent") { return ("...") }
        else if (loadstakeInit === "complete") { return ("good") }
        else { return ("Initialize") }
    }

    function returnNetStakeBalance() {
        var balance;
        //FIXME: merge all condition to wgetStakeStatus
        if (wgetStakeStatus === "inactive") {
            balance = stakebal / web.LAMPORTS_PER_SAFE;
        }
        else if (stakeInit === "delegated") {
            var rawbalance = stakebal / web.LAMPORTS_PER_SAFE;
            balance = rawbalance - wgetStakeAmount;
            //console.log("wgetStakeAmountwgetStakeAmount : ", wgetStakeAmount)
        }
        else {
            balance = stakebal / web.LAMPORTS_PER_SAFE;
        }
        return balance.toFixed(3);
    }

    function returnWithdrawStatus() {
        console.log("NOW withDrwSignStatus", withDrwSignStatus)
        if (withDrwSignStatus === "confirmed") {

            return (
                <button
                    className="fancy-button-gradient complete"
                >
                    Sent !
                </button>
            )
        } else if (withDrwSignStatus === "InsufficientFunds") {
            return (
                <div>
                    <div>Insufficient funds</div>
                    <button
                        className="fancy-button-gradient"
                        onClick={() => { tryToWithdrawStake(withdrwAmount, withdrwAddress); }}>
                        Retry
                    </button>
                </div>
            )
        }

        if (withdrwAmount !== "" && withdrwAddress != null) {
            // display button unlock
            console.log("withdrwAmount : ", withdrwAmount, "withdrwAddress : ", withdrwAddress)
            return (
                <button
                    className="fancy-button-gradient"
                    onClick={() => { tryToWithdrawStake(withdrwAmount, withdrwAddress); }}>
                    Withdraw
                </button>
            )
        } else {
            return (
                <button className="fancy-button-gradient-disabled">
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

    function displayAuthorityAddress() {
        if (stakeInit != null) {
            return (
                <div>
                    <div className="stake-auth">
                        <div className="stake-sauth-label">S-AUTH</div>
                        <div className="stake-subadd">{authKp}</div>
                    </div>
                    <div className="stake-auth">
                        <div className="stake-sauth-label">W-AUTH</div>
                        <div className="stake-subadd">{authKp}</div>
                    </div>
                </div>
            )
        } else {
            // should never be shown
            return (
                <div className="stake-fund-alert">DO NOT FUND THIS ADDRESS BEFORE INIT</div>
            )
        }

    }
    // dynamic : if contact button is clicked fire the ContactOrAddress useState
    function displayContactOrAddress() {

        return (
            <div className="just-flex">
                <input placeholder="Enter receive address" className="input-address-form" onChange={onChangeHandlerAddress} />
                <div className="small-action-button">
                    <ListOutline
                        color={'#000'}
                        height="22px"
                        width="22px"
                        style={{ verticalAlign: 'middle' }}
                    />
                </div>
            </div>
        )

    }

    function displayDelegationComponent() {
        //var AuthSave = localStorage.getItem('auth-mnemonic')
        //console.log("++**wgetStakeStatus : ", wgetStakeStatus);
        var MainSave = localStorage.getItem('mnemonic')
        var StakeSave = localStorage.getItem('stake-mnemonic')
        //console.log("stakeinitstakeinit : ", stakeInit)

        if (delegStatus === null && stakeInit === "initialized") {
            // means initialized & not delegated FIXME: more intuitive conditions
            return (
                <div>
                    <Delegation status={"INITIALIZED"} balance={stakebal / web.LAMPORTS_PER_SAFE} />
                </div>
            )
        } else if (stakeInit === "delegated") {
            console.log("StakePage.js - stakeInit CONDITION", wgetStakeStatus)
            // no controls show delegation component with stake data
            //FIXME: delegatedStatus={wgetStakeStatus}

            if (wgetStakeStatus === "inactive") {
                return (
                    <Delegation
                        status={"DELEGATED"}
                        balance={stakebal / web.LAMPORTS_PER_SAFE}
                        delegatedAmount={wgetStakeAmount * web.LAMPORTS_PER_SAFE}

                        delegatedStatus={wgetStakeStatus}
                    />
                )
            }

            return (
                <div>
                    <Delegation
                        status={"DELEGATED"}
                        balance={stakebal / web.LAMPORTS_PER_SAFE}
                        delegatedAmount={wgetStakeAmount * web.LAMPORTS_PER_SAFE}

                        delegatedStatus={wgetStakeStatus}
                    />
                    <div className="just-flex">

                    </div>
                </div>
            )
        }
    }

    function displayTopCard() {
        if (stakeInit === null) {
            // Stake account uninitialized
            return (
                <Card styleName='staking' cardContent={
                    <div className='stake-address-wrapper'>
                        <div className='safe-logo'></div>
                        <div className='safe-balance-numbers'>

                        </div>
                        <div className='stake-status'>
                            <div className="auth-container">
                                <div className="stake-address">You are about to initialize and create your stake account</div>
                            </div>
                            <div className='horizontal-space'></div>
                            {/* to rework*/}
                        </div>
                        <div className='stake-numbers'>
                            <div className='stake-numb-grid'>Rent : 0.002282922<br />Fees : 0.000000001</div>
                            <div className='stake-numb-grid'>
                                <div className="card-button-bottom" onClick={() => { tryToCreateStakeAccount() }}>{returnStakeInitLoading()}</div>
                            </div>
                        </div>
                    </div>
                } />
            )

        } else {
            // Stake account initialized
            return (
                <Card styleName='staking-init' cardContent={

                    <div className='stake-address-wrapper'>
                        <div className='safe-logo'></div>
                        <div className='safe-balance-numbers'>

                        </div>
                        <div className='stake-status'>
                            <div className="auth-container">
                                <div className="stake-address">{stakeAdd}</div>
                                {displayAuthorityAddress()}
                            </div>
                            <div className='horizontal-space'></div>
                            {/* to rework*/}

                        </div>
                        <div className='stake-numbers'>
                            <div className='stake-numb-grid'>
                                <Popup
                                    trigger={<div className="button-withdraw-stake" onClick={() => { }}>Withdraww</div>}
                                    modal
                                    nested
                                >
                                    {close => (
                                        <div className="modal">
                                            <button className="close" onClick={close}>
                                                &times;
                                            </button>
                                            <div className="content">
                                                <div className="hint-small">
                                                    Balance : {returnNetStakeBalance()}
                                                </div>
                                                <div className="input-amount-form-container">
                                                    <input type="number"
                                                        value={withdrwAmount}
                                                        max={returnNetStakeBalance()}
                                                        placeholder="0.00"
                                                        className="input-amount-form font-face-ob" onChange={onChangeHandlerAmount} />
                                                    <div className="input-amount-form-cur font-face-ob fancy-text-gradient"> SAFE</div>
                                                </div>
                                                <div className="hint-small"> = $ <b>188.9</b> USD</div>
                                                <br />
                                                <div className="label-stake-withdraw">Transfert to</div>
                                                {displayContactOrAddress()}
                                                <div className="vertical-space"></div>
                                                {/* <div className="range-input-container">
                                                    <RangeStepInput className="range-input" />
                                                    </div>*/}
                                                <div className="vertical-space"></div>
                                                <div className="label-stake-withdraw">Memo (W.I.P)</div>
                                                <input placeholder="Enter memo" className="input-address-form" />
                                                <div className="just-flex-between">
                                                    <div className="label-stake-withdraw">Network fees</div>
                                                    <div className="txt-small-warning orange">0.000000001 SAFE</div>
                                                </div>

                                            </div>
                                            <div className="hint-small-phrase">
                                                {' '}
                                                Immediate withdrawal of activated stake is not possible. Stake needs to be deactivated first.
                                            </div>
                                            <div className="actions">
                                                {returnWithdrawStatus()}
                                            </div>
                                        </div>
                                    )
                                    }
                                </Popup>
                            </div>
                            <div className='stake-numb-grid'>Balance : <b>{returnNetStakeBalance()}</b></div>
                            <div className='stake-numb-grid'>Status : <b>{returnDelegstatus()}</b></div>
                        </div>
                    </div>
                } />
            )
        }
    }

    if (wgetStakeStatus != null) {
        return (
            <div>
                <Title titleHeader='Stake' />

                {displayTopCard()}
                {displayDelegationComponent()}
            </div>
        );
    } else {
        // loading page
        return (
            <div>
                <Title titleHeader='Stake' />
                <Card styleName='page-loader' cardContent={
                    <div className="page-loader-container">
                        <CoffeeLoading speed="0.7" size="large" />
                    </div>
                } />
            </div>
        );
    }

}

export default StakePage;