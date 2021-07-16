import { Link } from 'react-router-dom';
import Card from '../common/Card';
import React from 'react';
import { wgetVoteAcc } from '../../utils/connection'
import Select from 'react-select'
import { useState } from 'react';
import { useEffect } from 'react';
import { LAMPORTS_PER_SAFE } from '@safecoin/web3.js';
import { wDelegate, wCreateStakeAccount, wgetStakeActivation, wgetParsedAccountInfo } from '../../utils/stake';
import Loader from "react-loader-spinner";
//import { , wCreateAuthKeypair, wCreateStakeKeypair, wgetParsedAccountInfo } from '../../utils/stake';
//const options = listCurrentVotesAccounts();

function Delegation(props) {
    // if initialized > show this component > Done
    /// if not delegated display :
    /// + validator selection list > Done
    /// + selected validator infos (com) > Done
    /// + summary of the staking instruction
    /// + approx time of activation duration (epoch)
    /// if delegated display :
    /// + show amount & APY + rewards
    /// actual validator

    const [NodeArray, setNodeArray] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const [wgetStakeStatus, setwgetStakeStatus] = useState(null);
    const [wgetStakeAmount, setwgetStakeAmount] = useState(null);

    // getAccountinfo area
    const [voter, setvoter] = useState(null);
    const [ActivationEpoch, setActivationEpoch] = useState(null);

    const [stakeAuthority, setstakeAuthority] = useState(null);
    const [withdrawAuthority, setwithdrawAuthority] = useState(null);
    console.log(" NODE ARRAY BEFORE useEffect : ", NodeArray.length)

    useEffect(() => {
        if (selectedNode != null) {
            wgetVoteAcc()
            .then(
                function (result) {
                    setNodeArray([result]);
                    console.log("NE DEVRAIT PAS SAFFICHER")
                })
            .catch((e) => { console.log("error", e) });
        }
        
    }, [])

    // console.log("options WWwesh : ", post)

    const valist = NodeArray[0];
    console.log("options template : ", valist)

    const handleSelectedNode = (event) => {
        console.log("Selected Node : ", event.value)
        setSelectedNode(event.value);
    }
    function tryToexecuteDelegation(selectedNode) {
        wDelegate()
            .then(function (val) {
                // you access the value from the promise here
                console.log("signature for wDelegate(selectedNode) : ", val);
            });
    }
    function returnDelegationActions() {
        if (selectedNode != null) {
            return (
                <div>
                    <div>delegate : {props.balance}</div>
                    <div>to : {selectedNode}</div>
                    <div className="card-button-center" onClick={() => { tryToexecuteDelegation() }}>Confirm</div>
                </div>
            )
        }
    }
    function returnDelegationSelect() {
        // first display after init ( not delegated )
        return (
            <div>

                <div className="stake-validator-dpd-cont">
                    <Select placeholder="Select a validator..." isSearchable={false} options={valist} onChange={handleSelectedNode} />
                </div>
                <div>
                    {returnDelegationActions()}
                </div>

            </div>
        )
    }

    useEffect(() => {
        wgetStakeActivation().then(function (result) {

            var clamport = result.active / LAMPORTS_PER_SAFE;
            setwgetStakeAmount(clamport);
            setwgetStakeStatus(result.state);
            console.log("**wgetStakeActivation : ", result);

        }).catch((e) => {
            console.log("getParsedAccountInfo ", e)
            //constatus = false;
        });
        wgetParsedAccountInfo().then(function (result) {

            //var clamport = result.active / LAMPORTS_PER_SAFE;
            //setwgetStakeAmount(clamport);
            //setwgetStakeStatus(result.state);
            var voter = result.value.data.parsed.info.stake.delegation.voter;
            var activationEpoch = result.value.data.parsed.info.stake.delegation.activationEpoch;
            var authstake = result.value.data.parsed.info.meta.authorized.staker;
            var withdrawer = result.value.data.parsed.info.meta.authorized.staker;
            setvoter(voter);
            setActivationEpoch(activationEpoch);
            setstakeAuthority(authstake);
            setwithdrawAuthority(withdrawer);
            console.log("** VOTE ADDRESS : ", result);

        }).catch((e) => {
            console.log("getParsedAccountInfo ", e)
            //constatus = false;
        });
    }, [])

    function returnDelegationInfo() {
        // show only if retrieved status is delegated
        if (wgetStakeStatus === null || wgetStakeStatus === undefined) {
            return (
                <div className="center-middle">
                <Loader
                    type="Puff"
                    color="#00BFFF"
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
                />
                </div>
            )
        }
        return (
            <div>
                <div className="active-stake-container">
                    <div className="active-stake-amount">{wgetStakeAmount}</div>
                    <div className="active-stake-state"></div>
                </div>
                <div>{wgetStakeStatus} stake : {wgetStakeAmount}</div>
                <div>delegated to {voter}</div>
                <div>staking activated at epoch {ActivationEpoch}</div>
            </div>
        )
    }

    console.log("props.status : ", props.status)

    function DelegationHub() {

      /*  if (props.status === null) {
            return (
                <div>rentinfos & initialize info</div>
            )
        } */
        
        if (props.status === "INITIALIZED") {
            return (
                returnDelegationSelect()
            )
        } else if (props.status === "DELEGATED") {
            return (
                returnDelegationInfo()
            )
        }
    }
    // if props.status == null return initialization & rent
    // if props.status == initialized return select a validator
    // if props.status == delegated return delegation infos status
    return (
        <Card styleName='staking-delegation' cardContent={
            <div>
                <div className="white-card-heading">Delegation infos</div>
                <div>{DelegationHub()}</div>
               
            </div>
        }></Card>
    );
}

export default Delegation;