import { Link } from 'react-router-dom';
import Card from '../common/Card';
import React from 'react';
import { wgetVoteAcc, wgetCurrentEpoch } from '../../utils/connection'
import Select from 'react-select'
import { useState } from 'react';
import { useEffect } from 'react';
import { LAMPORTS_PER_SAFE } from '@safecoin/web3.js';
import { wDelegate, wCreateStakeAccount, wgetStakeActivation, wgetParsedAccountInfo, wgetMyVoterStats } from '../../utils/stake';
import Loader from "react-loader-spinner";
import { Line } from 'rc-progress';

function Delegation(props) {
    // if initialized > show this component > Done
    /// if not delegated display :
    /// + validator selection list > Done
    /// + selected validator infos (com) > Done
    /// + summary of the staking instruction
    /// + approx time of activation duration (epoch) > done
    /// if delegated display :
    /// + show amount & APY + rewards
    /// actual validator > done

    const [NodeArray, setNodeArray] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const [wgetStakeStatus, setwgetStakeStatus] = useState(null);
    const [wgetStakeAmount, setwgetStakeAmount] = useState(null);

    // getAccountinfo area
    const [voter, setvoter] = useState(null);
    const [voterCom, setvoterCom] = useState(null);
    const [voterTotStake, setvoterTotStake] = useState(null);

    const [epochProgress, setepochProgress] = useState(null);

    const [ActivationEpoch, setActivationEpoch] = useState(null);

    const [stakeAuthority, setstakeAuthority] = useState(null);
    const [withdrawAuthority, setwithdrawAuthority] = useState(null);


    //wgetMyVoterStats(voter);

    useEffect(() => {
        wgetVoteAcc()
            .then(
                function (result) {
                    setNodeArray([result]);
                })
            .catch((e) => { console.log("error", e) });
    }, [])


    const valist = NodeArray[0];
    console.log("options template : ", valist)

    const handleSelectedNode = (event) => {
        console.log("Selected Node : ", event.value)
        setSelectedNode(event.value);
    }

    function tryToexecuteDelegation() {
        wDelegate(selectedNode)
            .then(function (val) {
                // you access the value from the promise here
                console.log("signature for wDelegate(selectedNode) : ", val);
            });
    }

    function returnDelegationActions() {
        // second display if account is initialized and a validator have been selected
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
            var activelamport = result.active;
            if (activelamport > 0 ) {
                setwgetStakeAmount(activelamport / LAMPORTS_PER_SAFE);
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
        wgetParsedAccountInfo().then(function (result) {

            var voter = result.value.data.parsed.info.stake.delegation.voter;
            var activationEpoch = result.value.data.parsed.info.stake.delegation.activationEpoch;
            var authstake = result.value.data.parsed.info.meta.authorized.staker;
            var withdrawer = result.value.data.parsed.info.meta.authorized.staker;
            setvoter(voter);
            setActivationEpoch(activationEpoch);
            setstakeAuthority(authstake);
            setwithdrawAuthority(withdrawer);

            //var test = await getvoter(voter);

            console.log("** voterstatsvoterstats : ", test);

        }).catch((e) => {
            console.log("getParsedAccountInfo ", e)
            //constatus = false;
        });

        wgetCurrentEpoch().then(function(result) {
            setepochProgress(result)
            console.log("wgetCurrentEpoch", result)
        }).catch((e) => {
            console.log("wgetCurrentEpoch ", e)
            //constatus = false;
        });

    }, [])

    useEffect(() => {
        if (voter != null) {
            wgetMyVoterStats(voter).then(function (result) {
                console.log("wgetMyVoterStats ", voter);
                var votercom = result[0].com;
                var voterstake = result[0].stake;
                var voterstakeTolam = voterstake / LAMPORTS_PER_SAFE;
                setvoterCom(votercom);
                setvoterTotStake(voterstakeTolam.toFixed(1));
            }).catch((e) => {
                console.log("wgetMyVoterStats ", e)
                //constatus = false;
            });

        }
    }, [voter])

    function returnProgressEpoch(){
        var label = "Checking..."
        if (wgetStakeStatus === "activating"){
            label = "Activation cooldown :"
        } else if (wgetStakeStatus === "active"){
            label = "Next payout :"
        }

        return (
            <div>
                <div>{label}</div>
                <Line percent={epochProgress} strokeWidth="3" strokeColor="#f3b283" />
            </div>
        )
    }

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
        } else {
            return (
                <div>
                    <div className="active-stake-container">
                        <div className="active-stake-amount">{wgetStakeAmount / LAMPORTS_PER_SAFE}</div>
                        <div className="active-stake-state">safe in <b>{wgetStakeStatus}</b> staking</div>
                    </div>
                    <div className="dotted-separator"></div>
                    <div className="stake-voter-container">
                        <div className="stake-voter-label">VOTE</div>
                        <div>
                            <div className="black-bg">{voter}</div>
                            <div className="stake-voter-info">
                                <div className="stake-voter-info"> comission  <div className="black-bg">{voterCom}</div></div>
                                <div className="stake-voter-info"> total stake <div className="black-bg">{voterTotStake}</div></div>
                            </div>
                        </div>
                    </div>
                    <div className="dotted-separator"></div>
                    <div className="vertical-space"></div>
                    {returnProgressEpoch()} 
                </div>
            )
        }
    }

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
                <div>{DelegationHub()}</div>
            </div>
        }></Card>
    );
}

export default Delegation;