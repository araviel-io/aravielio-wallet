import { LAMPORTS_PER_SAFE } from '@safecoin/web3.js';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { wgetLatestTransactions } from '../utils/connection';
import BalanceUp from '../assets/img/uparrow.svg';
import BalanceDown from '../assets/img/downarrow.svg';
import { aTrimAddressEnd } from '../utils/arafunc'

function TransactionList(props) {

    const mainAddress = localStorage.getItem('pubkey')

    const [TransactionArray, setTransactionArray] = useState([]);
    const [mainadd, setmainadd] = useState();

    useEffect(() => {
        wgetLatestTransactions(props.address).then(
            function (valistl) {
                setTransactionArray(valistl)
                setmainadd(mainAddress)
            })
            .catch((e) => { console.log("error wgetLatestTransactions", e) });
    }, [])

    function displayPrettyTransaction(item) {

        if (item.type === "transfer") {

            if (item.destination !== mainadd) {
                // sent
                return (
                    <>
                        <div className="transaction-item-icon-red">
                            <img src={BalanceDown} alt="React Logo" />
                        </div>
                        <div className="transaction-item-details">
                            <div><b>Sent</b> to</div>
                            <div className="transaction-address">{aTrimAddressEnd(item.destination)}</div>
                        </div>
                        <div className="transaction-item-amount tia-sent">- {parseFloat((item.amount / LAMPORTS_PER_SAFE).toFixed(2))}</div>
                    </>
                )
            } else {
                // received
                return (
                    <>
                        <div className="transaction-item-icon-green">
                            <img src={BalanceUp} alt="React Logo" />
                        </div>
                        <div className="transaction-item-details">
                            <div><b>Received</b> from</div>
                            <div className="transaction-address">{aTrimAddressEnd(item.source)}</div>
                        </div>
                        <div className="transaction-item-amount tia-received">+ {parseFloat((item.amount / LAMPORTS_PER_SAFE).toFixed(2))}</div>
                    </>
                )
            }

        } else if (item.type === "withdraw") {
            return (
                <>
                    <div className="transaction-item-icon-green">
                        <img src={BalanceUp} alt="React Logo" />
                    </div>
                    <div className="transaction-item-details">
                        <div><b>{item.type}</b> from</div>
                        <div className="transaction-address">{aTrimAddressEnd(item.source)}</div>
                    </div>
                    <div className="transaction-item-amount tia-received">+ {parseFloat((item.amount / LAMPORTS_PER_SAFE).toFixed(2))}</div>
                </>
            )
        }
    }

    console.log("FROM TRANSACTION LIST TransactionArray  :", TransactionArray)
    if (props.page === "mainwallet" || props.page === "stakepage") {
        return (
            <div className="transaction-container">
                <div className="sideinfo-title">Transactions</div>
                <div className="transaction-item-container">
                    {TransactionArray.map((item, i) => (
                        <div className="transaction-item" key={i}>
                            {displayPrettyTransaction(item)}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            test
        </div>
    );
}

export default TransactionList;