import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
// Layout
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import safelogo from '../../assets/img/safecoin_logov3.png'
// complex
import * as web from '@safecoin/web3.js';
import { sendSafe, transferSafe } from '../../utils/connection';
import { wgetBalance } from '../../utils/connection';
import { wKeypair } from '../../utils/connection';

const network = localStorage.getItem('network')
const connection = new web.Connection(network, "processed");


function SendPage(props) {

    const mnemonic = localStorage.getItem('mnemonic')

    const [balance, setBalance] = useState(0);
    // 
    const [amountValue, setAmountValue] = useState(0);
    const [addressInput, setAddressInput] = useState('');
    const [sendStatus, setSendStatus] = useState('Send');


    async function tryTransfert(addressInput, amountValue) {
        // check that every fields are filled before sending the request
        if (addressInput !== undefined && amountValue !== 0)
        {
            const convToLamport = web.LAMPORTS_PER_SAFE * amountValue;
            const transfertToHook = await transferSafe(addressInput, convToLamport);
            sendStatusPromiseEffect(transfertToHook)
            // output signature "2ZFwRSWCnjvnRSEJjnqQYntKJQQnDANSHTcroRaR1f7qXgYT5cRtSee7JgGroax51mbiWxfbyZxTA6P426kQ7yKR"
            console.log("testbistoufly : ", transfertToHook)
        }
        //calculer amount - tx convert tout en lamport
        //console.log("addressInput: ", addressInput, "amountValue: ", amountValue)
    }

    async function sendStatusPromiseEffect(signature) {
        if (signature != null) {
            const tstatus3 = await connection.getSignatureStatus(signature);
            setSendStatus(signature);
            console.log(tstatus3);
        }
    }
    useEffect(() => {
        sendStatusPromiseEffect();

    });
    async function balancePromiseEffect() {
        const response = await wgetBalance(mnemonic)
        .catch((e)=>{
            const error = 'Error'
           // return e.code;
           //const error = e.
            console.log("error",error.code)
        });
        //const nomreponse = await wngetSafePrice();

        // console.log("SAFE PRICE FROM WALLET :", safeprice)
        setBalance(response);
        console.log("response ?",response)
        // setsafeprice(nomreponse);
    }
    useEffect(() => {
        balancePromiseEffect();

    });
    function returnStatus() {
        console.log("SendStatus : ", sendStatus)
        if (sendStatus === undefined) {
            return ('Send')

        } else if (sendStatus !== undefined) {
            return ('Sending...')
        } 
    }
    function returnBalance() {
        if (balance == null) {
            return ('Loading balance')
        } else if (balance === 0) {
            return ('0')
        } else { return (balance) }
    }

    const onChangeHandlerAmount = event => {
        setAmountValue(event.target.value);
    };
    const onChangeHandlerAddress = event => {
        setAddressInput(event.target.value);
    };
    // display non-disabled sending button if fields are correct
    function checkAmount(amountValue, addressInput) {
        //console.log("validateMNEMONIC", WordCount(mnemonic));
        if (amountValue > 0 && addressInput !== '') {
            return <div className="card-button" onClick={() => { tryTransfert(addressInput, amountValue) }}> {returnStatus()}</div>;
        } else {
            return <div className="card-button-disabled"> Send</div>;
        }
    }
        return (
            <div>
                <Title titleHeader='Send' />
                <Card cardContent={
                    <div>
                        <div className="send-from-area">
                            <div className="card-subtitle">From</div>
                            <div className="send-from-content-main">
                                <div className="send-safe-icon">
                                    <img className="sendsafeimg" src={safelogo}></img>
                                </div>
                                <div className="send-safe-text-balance">
                                    <div className="send-safe-tb-wrapper">
                                        <div className="send-s-text">{returnBalance()}</div>
                                       
                                        <input type="number" min="0" max={balance} step=".01" placeholder="0" className="card-input" onChange={onChangeHandlerAmount} ></input>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="clearfix"></div>
                        <div className="send-from-area">
                            <div className="card-subtitle">To</div>
                            <div className="send-from-content-main">
                                <input placeholder="Enter recipient" className="card-input-address" onBlur={onChangeHandlerAddress} ></input>
                            </div>
                        </div>
                        <div>
                            <div className="btncontainer">
                                {/* return the according button */}
                                {checkAmount(amountValue, addressInput)}

                            </div>
                        </div>
                    </div>
                }>
                </Card>
            </div>
        );
}

export default SendPage;