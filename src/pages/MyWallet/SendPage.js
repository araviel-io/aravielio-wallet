import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
// Layout
import { ListOutline, AddOutline, CheckmarkOutline } from 'react-ionicons'
import Select from 'react-select';
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import { toast } from 'react-toastify';
// complex
import { aSafePriceForAmount, aStoreContacts, aGetContacts, aSelCustomStyles, aHrefSeeOnExplorer } from '../../utils/arafunc';
import { tTransfertSafe } from '../../utils/transfert';
import { wgetSignatureStatus, wgetBalance } from '../../utils/connection';
import TransactionList from '../../components/TransactionList';

// test
function SendPage(props) {

    localStorage.setItem('page', "sendpage")
    const getAddress = localStorage.getItem('pubkey')
    const mnemonic = localStorage.getItem('mnemonic')

    const [mainAddress, setmainAddress] = useState();

    const [balance, setBalance] = useState(0);
    // 
    const [withdrwAmount, setwithdrwAmount] = useState("");
    const [withdrwAddress, setwithdrwAddress] = useState(null);
    const [sendSignStatus, setSendSignStatus] = useState(null);

    const [ContactOrAddress, setContactOrAddress] = useState("address");
    // Below is just UI state for dislaying add address into contacts
    const [ToggleNewAddress, setToggleNewAddress] = useState("closed");
    const [AddContactLabelValue, setAddContactLabelValue] = useState("");
    const [AddContactAddressValue, setAddContactAddressValue] = useState("");

    async function tryToSendSafe(amount, address) {
        setSendSignStatus("requesting");
        console.log("tryToWithdrawStake AMOUNT : ", amount)
        tTransfertSafe(amount, address)
            .then(function (signature) {
                setSendSignStatus("sent");
                wgetSignatureStatus(signature)
                    .then(function (result) {
                        console.log("NOW : wgetSignatureStatus(signature)", result)
                        if (result.value.err === null) {
                            setSendSignStatus("confirmed");
                            wgetBalance(mnemonic).then(
                                function (balance) {
                                    console.log("**wgetBalance   : ", balance);
                                    setBalance(balance - withdrwAmount);
                                    console.log("**wgetBalance promise : ", balance)
                                })
                                .catch((e) => {
                                    console.log("**wgetBalance promise ERROR", e)
                                });
                        } else {
                            setSendSignStatus(result.value.err.InstructionError[1]);
                        }
                        setwithdrwAmount(0);
                    })
                    .catch((e) => { console.log("*---- getSignatureStatus(signature) : ", e) });
            })
            .catch((e) => { console.log("**tryToWithdrawStake ERROR FROM STAKEPAGE : ", e) });
    }

    useEffect(() => {
        setmainAddress(getAddress);
        if (sendSignStatus == null) {
            wgetBalance(mnemonic).then(
                function (balance) {
                    setBalance(balance);
                })
                .catch((e) => {
                    //console.log("**wgetBalance promise ERROR", e)
                });
        }
    }, [balance]);

    function returnBalance() {
        if (balance == null) {
            return ('Loading balance')
        } else if (balance === 0) {
            return ('0')
        } else { return (balance) }
    }


    //#region SendWithdraw Address & Contact 
    const contactList = aGetContacts();

    const handleSelectedContact = (event) => {
        console.log("Selected Node : ", event.value)
        setwithdrwAddress(event.value)
    }

    // dynamic : if contact button is clicked fire the ContactOrAddress useState
    const onChangeAddLabel = (event) => { setAddContactLabelValue(event.target.value) }
    const onChangeAddAddress = (event) => { setAddContactAddressValue(event.target.value) }
    // Send : address & amount handlers
    const onChangeHandlerAddress = event => { setwithdrwAddress(event.target.value) };
    const onChangeHandlerAmount = event => { setwithdrwAmount(event.target.value) };

    function returnWithdrawStatus() {
        console.log("NOW withDrwSignStatus", sendSignStatus)
        if (sendSignStatus === "confirmed") {
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
        if (sendSignStatus === "requesting" || sendSignStatus === "sent") {

            return (
                <button className="fancy-button-gradient">Sending...</button>
            )

        }
        if (sendSignStatus === "InsufficientFunds") {
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
                        onClick={() => { tryToSendSafe(withdrwAmount, withdrwAddress); }}>
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
                    onClick={() => { tryToSendSafe(withdrwAmount, withdrwAddress); }}>
                    Send
                </button>
            )
        } else {
            return (
                <button className="fancy-button-gradient-disabled">Send</button>
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

    return (
        <div className="just-flex myanim">
            <div>
                <Title titleHeader='Send' />
                <Card cardContent={
                    <div>
                        <div className="content">
                            <div className="hint-small">
                                Balance : {returnBalance()}
                            </div>
                            <div className="input-amount-form-container">
                                <input type="number"
                                    value={withdrwAmount}
                                    max={returnBalance()}
                                    placeholder="0.00"
                                    className="input-amount-form font-face-ob" onChange={onChangeHandlerAmount} />
                                <div className="input-amount-form-cur font-face-ob fancy-text-gradient"> SAFE</div>
                                <div className="set-max" onClick={() => { setwithdrwAmount(returnBalance()) }}>set max</div>
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

                        </div>
                        <div className="actions">
                            {returnWithdrawStatus()}
                        </div>
                    </div>
                }>
                </Card>
            </div>
            { tryTogetRecentTransactions()}
        </div>
    );
}

export default SendPage;