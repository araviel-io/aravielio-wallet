import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import Popup from 'reactjs-popup';
import { CoffeeLoading } from 'react-loadingg';
import { ListOutline, AddOutline, CheckmarkOutline } from 'react-ionicons'
import Select from 'react-select'
import { toast } from 'react-toastify';
//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import Delegation from '../../components/stake/Delegation';

import { aSafePriceForAmount, aStoreContacts, aGetContacts, aSelCustomStyles, aHrefSeeOnExplorer } from '../../utils/arafunc';
import { wCreateStakeAccount, wCreateStakeKeypair, wgetStakeActivation, wWithdrawStake } from '../../utils/stake';
import { wKeypair, wgetSignatureStatus } from '../../utils/connection'

import * as web from '@safecoin/web3.js';
import TransactionList from '../../components/TransactionList';

const network = localStorage.getItem('network')
const connection = new web.Connection(network, "processed");
const getAddress = localStorage.getItem('pubkey')
//  TODO: delegated validator info (picture from keybase, better sub-card)
//  TODO: reward tab
function StakePage(props) {
    localStorage.setItem('page', "stakepage")
    const [mainAddress, setmainAddress] = useState();

    const [authKp, setauthAdd] = useState(null);

    const [MainBal, setMainBal] = useState(null);

    const [stakeAdd, setstakeAdd] = useState(null);
    const [stakebal, setstakebal] = useState(null);
    const [stakeInit, setstakeInit] = useState(null);

    // only for text display
    const [loadstakeInit, setloadstakeInit] = useState(null);

    const [delegStatus, setdelegStatus] = useState(null);

    const [wgetStakeAmount, setwgetStakeAmount] = useState(null);
    const [wgetStakeStatus, setwgetStakeStatus] = useState(null);

    const [withdrwAmount, setwithdrwAmount] = useState("");
    const [withdrwAddress, setwithdrwAddress] = useState(null);

    const [withDrwSignStatus, setwithDrwSignStatus] = useState(null);


    // DisplayContactOrAddressI > "address" if defualt
    const [ContactOrAddress, setContactOrAddress] = useState("address");
    // Below is just UI state for dislaying add address into contacts
    const [ToggleNewAddress, setToggleNewAddress] = useState("closed");
    const [AddContactLabelValue, setAddContactLabelValue] = useState("");
    const [AddContactAddressValue, setAddContactAddressValue] = useState("");
    const [ContactSelection, setContactSelection] = useState("address");

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
        await connection.getBalance(mainkeypair.publicKey).then(function (result) {
            setMainBal(result);
            console.log("MAIN BALANCE FROM STAKE PAGE:", MainBal)
        });
        await connection.getParsedAccountInfo(stakekeypair.publicKey)
            .then(function (result) {
                if (result.value !== null) {
                    console.log("StakePage.js - getParsedAccountInfo(stakekeypair.publicKey) ", result)
                    var getStakingType;
                    try {
                        getStakingType = result.value.data.parsed.type;
                        var getDelegationStatus = result.value.data.parsed.info.stake;
                    } catch (e) {
                        // FIXME: VERY DIRTY
                        getStakingType = null;
                        console.log(" ISSUE getParsedAccountInfo", e.message)
                    }
                    setstakeInit(getStakingType);
                    console.log("StakePage.js -  setstakeInit(getStakingType); ", getStakingType)
                    setdelegStatus(getDelegationStatus);
                    console.log("*getParsedAccountInfo : ", result);
                } else {
                    // it means created but NOT init
                    setstakeInit("NOT INIT");
                }
            }).catch((e) => {
                console.log("getParsedAccountInfo ex", e)
            });
    }

    useEffect(() => {
        setmainAddress(getAddress);
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
            }).catch((e) => {
                console.log("Can't create stake account : ", e.message)
            });;
    }
    // never returns actions if accounts are not loaded
    async function tryToWithdrawStake(amount, address) {
        setwithDrwSignStatus("requesting");
        console.log("tryToWithdrawStake AMOUNT : ", amount)
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
    // why
    useEffect(() => {
        if (withDrwSignStatus === "confirmed") {
            setwithDrwSignStatus("null");
            setstakebal(stakebal - withdrwAmount)
        }
    }, [withDrwSignStatus, stakebal, withdrwAmount]);
    //console.log('%c StakePage.js recUnConfAmount : ', 'background: red; color: #bada55', recUnConfAmount)
    //console.log(recUnConfAmount)
    function returnStakeInitLoading() {
        if (loadstakeInit === "sent") {
            return (<div className="card-button-bottom disabled">Initializing ...</div>)
        }
        else if (loadstakeInit === "complete") { return ("good") }
        else if (MainBal === 0 && stakeInit === "NOT INIT") {
            return (<div className="card-button-bottom disabled">Can't initialize</div>)
        }
        else {
            return (<div className="card-button-bottom" onClick={() => { tryToCreateStakeAccount() }}>Initialize</div>)
        }
    }

    function returnNetStakeBalance() {
        //const fees = aFeesForNetwork();
        // const test = fees / (web.LAMPORTS_PER_SAFE);
        var balance;
        if (wgetStakeStatus === "inactive") {
            balance = stakebal / web.LAMPORTS_PER_SAFE;
        }
        else if (stakeInit === "delegated") {
            var rawbalance = stakebal / web.LAMPORTS_PER_SAFE;
            balance = rawbalance - wgetStakeAmount;
        }
        else {
            balance = stakebal / web.LAMPORTS_PER_SAFE;
        }
        if (balance <= 0.0023) {
            balance = 0;
        } else if (balance >= 1) {
            balance = balance.toFixed(1)
        }
        else {
            balance = balance - 0.0023;
            console.log("TEST balance TEST", balance)
        }
        return balance;
    }

    function returnWithdrawStatus() {
        console.log("NOW withDrwSignStatus", withDrwSignStatus)
        if (withDrwSignStatus === "confirmed") {
            function successAlert() {
                toast(aHrefSeeOnExplorer(), {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                toast.clearWaitingQueue();

            }
            successAlert()
            return (
                <button className="fancy-button-gradient">Sent !</button>)
        }
        if (withDrwSignStatus === "requesting" || withDrwSignStatus === "sent") {

            return (
                <button className="fancy-button-gradient">Sending...</button>
            )

        }
        if (withDrwSignStatus === "InsufficientFunds") {
            function insufficientFundsAlert() {
                toast.error("Insufficient funds !", {
                    position: toast.POSITION.BOTTOM_RIGHT
                });
                toast.clearWaitingQueue();
                //setwithDrwSignStatus(null);
            }
            //
            return (
                <div>
                    <div>Insufficient funds</div>
                    {insufficientFundsAlert()}
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
                <button className="fancy-button-gradient-disabled">Withdraw</button>
            )
        }

    }
    const onChangeHandlerAddress = event => {
        setwithdrwAddress(event.target.value);
    };

    const onChangeHandlerAmount = event => {
        setwithdrwAmount(event.target.value);
        console.log("WITHDRAW AMOUNT : ", withdrwAmount)
    };

    //#region SendWithdraw Address & Contact 
    const contactList = aGetContacts();

    const handleSelectedContact = (event) => {
        console.log("Selected Node : ", event.value)
        setwithdrwAddress(event.value)

    }

    // dynamic : if contact button is clicked fire the ContactOrAddress useState
    const onChangeAddLabel = (event) => { setAddContactLabelValue(event.target.value) }
    const onChangeAddAddress = (event) => { setAddContactAddressValue(event.target.value) }

    function displayContactOrAddress() {

        function SaveNewContact() {
            aStoreContacts(AddContactLabelValue, AddContactAddressValue)
            setToggleNewAddress("closed");
        }

        function toggleAddOrInput() {

            function checkInputFields() {

                console.log("setAddContactLabelValue state : ", AddContactLabelValue, "setAddContactAddressValue state : ", AddContactAddressValue)
                if (AddContactAddressValue !== "" && AddContactLabelValue !== "") {
                    return (
                        <div className="small-action-button">
                            <CheckmarkOutline color={'#000'} height="22px" width="22px" title="Save contact"
                                onClick={() => { SaveNewContact() }}
                                style={{ verticalAlign: 'middle' }}
                            />
                        </div>
                    )
                } else {
                    return (
                        <div className="small-action-button-disabled">
                            <CheckmarkOutline color={'#b5b5b5'} height="22px" width="22px" style={{ verticalAlign: 'middle' }} />
                        </div>
                    )
                }
            }

            if (ToggleNewAddress === "closed") {
                // TRANSFERT TO CONTACT (SELECT)
                return (
                    <div className="transfert-fixed-container">
                        <div className="just-flex">
                            <div className="transfert-back-button" onClick={() => { setContactOrAddress("address") }}>
                                back
                            </div>
                            <div className="label-stake-withdraw">   Transfert to contact</div>
                        </div>
                        <div className="vertical-space"></div>
                        <div className="just-flex">
                            <Select placeholder="Select you saved addresse..." className="transfert-select-contact" isSearchable={false} styles={aSelCustomStyles} options={contactList} onChange={handleSelectedContact} />
                            <div className="small-action-button">
                                <AddOutline color={'#000'} height="22px" width="22px" title="Add new contact"
                                    onClick={() => { setToggleNewAddress("toggle") }}
                                    style={{ verticalAlign: 'middle' }}
                                />
                            </div>
                        </div>
                    </div>
                )
            } else {
                // REGISTER NEW CONTACT (ADD)
                return (
                    <div className="transfert-fixed-container">
                        <div className="just-flex">
                            <div className="transfert-back-button" onClick={() => { setToggleNewAddress("closed") }}>
                                back
                            </div>
                            <div className="label-stake-withdraw">   Register new contact</div>
                        </div>
                        <div className="vertical-space"></div>
                        <div className="just-flex">
                            <input placeholder="Label" className="input-address-form add-contact-label" onChange={onChangeAddLabel} />
                            <input placeholder="Address" className="input-address-form" onChange={onChangeAddAddress} />
                            {checkInputFields()}
                        </div>
                    </div>
                )
            }
        }

        if (ContactOrAddress === "address") {
            // SEND TO ADDRESS
            return (
                <div className="transfert-fixed-container">
                    <div className="label-stake-withdraw">Transfert to</div>
                    <div className="vertical-space"></div>
                    <div className="just-flex">
                        <input placeholder="Enter receive address" className="input-address-form" onChange={onChangeHandlerAddress} />
                        <div className="small-action-button">
                            <ListOutline
                                color={'#000'}
                                height="22px"
                                width="22px"
                                title="Chose a contact"
                                onClick={() => { setContactOrAddress("contact") }}
                                style={{ verticalAlign: 'middle' }}
                            />
                        </div>
                    </div>
                </div>
            )
        } else {
            // localstorage get address list etc
            return (
                <div>
                    {toggleAddOrInput()}

                </div>
            )
        }
    }
    //#endregion
    function displayDelegationComponent() {

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
                        stakeadd={stakeAdd}
                        delegatedStatus={wgetStakeStatus}
                    />
                    <div className="just-flex">

                    </div>
                </div>
            )
        }
    }


    function tryTogetRecentTransactions() {
        // will be someday converted to tryTogetRecentInstructions
        if (mainAddress !== undefined) {
            return (
                <TransactionList page="mainwallet" address={mainAddress} />
            )
        } else {
            // placeholder for later use
        }
    }

    function displayTopCard() {
        if (stakeInit === "NOT INIT") {
            // this condition is triggered connection.getParsedAccountInfo(stakekeypair.publicKey)
            // Stake account uninitialized
            return (
                <Card styleName='staking' cardContent={
                    <div className='stake-address-wrapper'>
                        <div className='stake-status'>
                            <div className="auth-container">
                                <div className="stake-address">You are about to initialize and create your stake account</div>
                            </div>
                            <div className='horizontal-space'></div>
                            {/* to rework*/}
                        </div>
                        <div className='stake-numbers'>
                            <div className='stake-numb-grid'>Rent : 0.002282922<br />Fees : 0.0002</div>
                            <div className='stake-numb-grid'>
                                {returnStakeInitLoading()}

                            </div>
                        </div>
                        {MainBal === 0 ? <div className="stake-fund-alert">Please fund your main address to initialize</div> : <></>}

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
                            </div>
                            <div className='horizontal-space'></div>
                            {/* to rework*/}

                        </div>
                        <div className='stake-numbers'>
                            <div className='stake-numb-grid'>
                                <Popup
                                    trigger={<div className="button-withdraw-stake" onClick={() => { }}>Withdraw</div>}
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
                                                    <div className="set-max" onClick={() => { setwithdrwAmount(returnNetStakeBalance()) }}>set max</div>
                                                </div>
                                                <div className="hint-small"> = $ <b>{aSafePriceForAmount(withdrwAmount)}</b> USD</div>
                                                <br />

                                                {displayContactOrAddress()}
                                                <div className="vertical-space"></div>
                                                {/*
                                                <div className="label-stake-withdraw">Memo (W.I.P)</div>
                                                <input placeholder="Enter memo" className="input-address-form" />
                                                */}
                                                <div className="just-flex-between">
                                                    <div className="label-stake-withdraw">Network fees</div>
                                                    <div className="txt-small-warning orange">0.0001 SAFE</div>
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

    if (stakeInit != null) {
        return (
            <div className="just-flex">
                <div>
                    <Title titleHeader='Stake' />
                    {displayTopCard()}
                    {displayDelegationComponent()}
                </div>
                <div>
                {tryTogetRecentTransactions()}
                </div>
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