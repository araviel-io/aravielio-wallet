import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import safelogo from '../../assets/img/safecoin-logo.png';

import { wngetSafePrice } from '../../utils/nomics';
import { wgetBalance, solRequestAirdrop, wgetLatestTransactions } from '../../utils/connection';
import TransactionList from '../../components/TransactionList';

///// TODO: HERE
// first mnemonic word
// token listing
// credit card style instead logo
/////


function WalletPage(props) {

    const mnemonic = localStorage.getItem('mnemonic')
    const network = localStorage.getItem('network')
    const getAddress = localStorage.getItem('pubkey')


    const [balance, setBalance] = useState();
    // nomics query
    const [safeprice, setsafeprice] = useState();
    const [mainAddress, setmainAddress] = useState();
    // Display airdrop button if solana devnet
    function checkDevnet() {

        if (network === 'https://api.devnet.solana.com') {
            console.log("NETWORKLOL ", network)
            return (
                <button onClick={solRequestAirdrop}>Request Airdrop</button>
            );
        }
    }

    useEffect(() => {
        if (localStorage.hasOwnProperty("mnemonic")) {
            wgetBalance(mnemonic).then(
                function (balance) {
                    setBalance(balance);
                })
                .catch((e) => {
                    console.log("*wgetBalance catch((e)", e)
                });
            wngetSafePrice().then(
                function (safeprice) {
                    setsafeprice(safeprice);
                    localStorage.setItem('safeprice', safeprice)
                })
                .catch((e) => {
                    console.log("*wngetSafePrice catch((e)", e)
                })
                wgetLatestTransactions(getAddress);
                setmainAddress(getAddress);
        }
    }, []);

    function returnBalance() {
        if (balance === "NaN") {
            return ('Loading balance')
        } else if (balance === 0) {
            return ('0')
        } else {
            return (balance)
        }
    }
    function returnSafePrice() {
        if (safeprice == null) {
            return ('Loading price')
        } else {

            var test = safeprice * balance;
            var trunc = test.toFixed(2)
            return (trunc)
        }
    }

    function tryTogetRecentTransactions() {

        if (mainAddress !== undefined) {
            return (
                <TransactionList page="mainwallet" address={mainAddress} />
            )
        } else {

        }
    }

    return (
        <div className="just-flex">
            <div>
                <Title titleHeader='Wallet' />
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
                } />
                <Title titleHeader='Tokens' />
                <Card cardContent={
                    <div className='safe-balance-wrapper'>
                        <div>No Tokens found</div>
                    </div>
                } />
            </div>
            { tryTogetRecentTransactions()}
              
        </div>

    );
}

export default WalletPage;