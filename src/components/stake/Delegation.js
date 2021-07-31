import Card from '../common/Card';
import React from 'react';
import Select from 'react-select'
import styles from './Delegation.module.css';

import { useState } from 'react';
import { useEffect } from 'react';
import { LAMPORTS_PER_SAFE } from '@safecoin/web3.js';
import { wDelegate, wgetParsedAccountInfo, wgetMyVoterStats } from '../../utils/stake';
import { wgetVoteAcc, wgetCurrentEpoch, wgetRemainingTime, wgetInflation, wgetSignatureConfirmation } from '../../utils/connection'
import { Line } from 'rc-progress';
import { HourglassOutline } from 'react-ionicons'
import { CoffeeLoading } from 'react-loadingg';

import LiveConfirmation from '../../components/transfert/LiveConfirmation';
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

    // getAccountinfo area
    const [voter, setvoter] = useState(null);
    const [voterCom, setvoterCom] = useState(null);
    const [voterTotStake, setvoterTotStake] = useState(null);

    const [epochProgress, setepochProgress] = useState(null);
    const [remainingTime, setremainingTime] = useState(null);

    /* const [ActivationEpoch, setActivationEpoch] = useState(null);
 
     const [stakeAuthority, setstakeAuthority] = useState(null);
     const [withdrawAuthority, setwithdrawAuthority] = useState(null);*/

    const [loadDelegStatus, setloadDelegStatus] = useState(null);

    //setinterval master signature
    const [DelegSign, setDelegSign] = useState(null);
    const [DelegConfAmount, setDelegConfAmount] = useState(null);
    const [DelegConfStatus, setDelegConfStatus] = useState(null);

    const [apy, setApy] = useState(null);
    //wgetMyVoterStats(voter);

    useEffect(() => {
        // setPropsStatus(props.delegatedStatus);
        // console.log("Delegation.js - PROPS MYSTIQUE : ", propsStatus);
        wgetVoteAcc()
            .then(
                function (result) {
                    setNodeArray([result]);
                })
            .catch((e) => { console.log("error", e) });
        wgetInflation()
            .then(
                function (result) {
                    setApy([result]);
                })
            .catch((e) => { console.log("error", e) });
    }, [])


    const valist = NodeArray[0];
    //console.log("options template : ", valist)

    // only for select (pre-delegation)
    const handleSelectedNode = (event) => {
        console.log("Selected Node : ", event.value)
        setSelectedNode(event.value);
        wgetMyVoterStats(event.value).then(function (result) {
            console.log("Delegation.js - wgetMyVoterStats ", voter);
            var votercom = result[0].com;
            var voterstake = result[0].stake;
            var voterstakeTolam = voterstake / LAMPORTS_PER_SAFE;
            setvoterCom(votercom);
            setvoterTotStake(voterstakeTolam.toFixed(1));
        }).catch((e) => {
            console.log("Delegation.js - wgetMyVoterStats ", e)
            //constatus = false;
        });
    }


    function tryToexecuteDelegation() {
        setloadDelegStatus("requesting")
        wDelegate(selectedNode)
            .then(function (delegsign) {
                setDelegSign(delegsign)
                setloadDelegStatus("sent")
                // trigger to stop the loop
                const interval = setInterval(() => {
                    wgetSignatureConfirmation(delegsign)
                        .then(function (signArray) {
                            setloadDelegStatus("processing")
                            //setNodeArray(null)
                            setDelegConfAmount(signArray[0].amount)
                            setDelegConfStatus(signArray[0].label)
                            console.log('%c DDDelegation.js : ', 'background: #da5820; color: #bada55', signArray[0].amount)
                            console.log('%c DDDelegation.js : ', 'background: #da5820; color: #bada55', signArray[0].label)
                            console.log('%c DDDelegation.js DelegConfAmount : ', 'background: #da5820; color: #bada55', DelegConfAmount)
                            if (signArray[0].label === "finalized") {
                                console.log('%c Delegation.js : CLEAR INTERVAL', 'background: #da5820; color: #3861fb')
                                clearInterval(interval);
                            }
                        })
                }, 1000)
                setloadDelegStatus("complete")

            });
    }

    function returnDelegLoading() {
        //FIXME: instead of text, returns whole control with according disabled state
        if (loadDelegStatus === "requesting" || loadDelegStatus === "sent" || loadDelegStatus === "processing" || loadDelegStatus === "complete") { return ("...") }
        else { return ("Stake now !") }
    }

    function returnDelegationActions() {

        // second display if account is initialized and a validator have been selected
        if (selectedNode != null) {
            return (
                <div>
                    <div className="summary-container">
                        <div className="summary-content">
                            <div>

                                <div className="summary-t">
                                    {/*<div>
                                        <div className="summary-aya">DELEGATION<br />SUMMARY</div>
                                    </div>*/}
                                </div>
                                <div>
                                    {/* <div className="stake-voter-info">
                                        <div className="stake-voter-info"> comission  <div className="black-bg">{voterCom} %    </div></div>
                                        <div className="stake-voter-info"> total stake <div className="black-bg">{voterTotStake}</div></div>
                                    </div>
                                    <div>{selectedNode}</div> */}

                                    <div className="pre-delegation-summary-container">
                                        <div className="stake-numb-grid">Amount : <b>{props.balance} SAFE</b></div>
                                        <div className="stake-numb-grid">APY : <b>{apy} %</b></div>
                                        <div className="stake-numb-grid">V.COM : <b>{voterCom} %</b></div>
                                    </div>
                                    <div className="stake-activation-eta-container"><HourglassOutline color={'#00000'} height="40px" width="40px" />
                                        <div className="stake-activation-eta-info">
                                            your staking will be active in approx.<br /> <b>{remainingTime}</b> hours after delegation.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='stake-numbers'>
                        <div className='stake-numb-grid'></div>
                        <div className='stake-numb-grid'>
                            <div className="card-button-bottom inverted" onClick={() => { tryToexecuteDelegation() }}>{returnDelegLoading()}</div>
                        </div>
                    </div>

                </div>
            )
        }
    }

    function returnDelegationSelect() {
        // first display after init ( not delegated )
        return (
            <div>
                <div className="stake-validator-dpd-cont">
                    <Select placeholder="Select a validator..." className="input-react-select" isSearchable={false} options={valist} onChange={handleSelectedNode} />
                </div>
                <div>
                    {returnDelegationActions()}
                </div>
            </div>
        )
    }

    useEffect(() => {
        console.log("Delegation.js - PROPSSTATUS : ", props.status)
        if (props.status === "DELEGATED") {
            wgetParsedAccountInfo().then(function (result) {

                var voter = result.value.data.parsed.info.stake.delegation.voter;
                var activationEpoch = result.value.data.parsed.info.stake.delegation.activationEpoch;
                var authstake = result.value.data.parsed.info.meta.authorized.staker;
                var withdrawer = result.value.data.parsed.info.meta.authorized.staker;
                setvoter(voter);
                /*
                setActivationEpoch(activationEpoch);
                setstakeAuthority(authstake);
                setwithdrawAuthority(withdrawer);*/

                //var test = await getvoter(voter);

                console.log("** wgetParsedAccountInfo().then(function (result) : ");

            }).catch((e) => {
                console.log("getParsedAccountInfo ", e)
                //constatus = false;
            });

            wgetCurrentEpoch().then(function (result) {
                setepochProgress(result)
                console.log("Delegation.js - wgetCurrentEpoch", result)
            }).catch((e) => {
                console.log("Delegation.js - wgetCurrentEpoch ", e)
                //constatus = false;
            });
        } else if (props.status === "INITIALIZED") {
            //console.log("props.status INIT ZZBI ", propsStatus)
            wgetRemainingTime().then(function (result) {
                setremainingTime(result)
                console.log("Delegation.js - wgetRemainingTime", result)
            }).catch((e) => {
                console.log("Delegation.js - wgetRemainingTime ", e)
                //constatus = false;
            });
        }
    }, [])

    useEffect(() => {
        if (voter != null) {
            wgetMyVoterStats(voter).then(function (result) {
                console.log("Delegation.js - wgetMyVoterStats ", voter);
                var votercom = result[0].com;
                var voterstake = result[0].stake;
                var voterstakeTolam = voterstake / LAMPORTS_PER_SAFE;
                setvoterCom(votercom);
                setvoterTotStake(voterstakeTolam.toFixed(1));
            }).catch((e) => {
                console.log("Delegation.js - wgetMyVoterStats ", e)
                //constatus = false;
            });

        }
    }, [voter])

    function returnProgressEpoch(one) {
        
        var label = "Checking..."
        if (props.delegatedStatus === "activating") {
            label = "Activation cooldown :"
        } else if (props.delegatedStatus === "active") {
            label = "Next payout :"
        } else if (one != null) {
            label = "Activation cooldown :"
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
        //console.log("Delegation.js props.delegatedStatus", props.delegatedStatus)
        if (props.delegatedStatus === null || props.delegatedStatus === undefined) {
            // FIXME: God freaking props, wasn't ready for that
            // Tofix : find a way to get all the properties needed for displaying the filled delegation infos without refresh the page
            // maybe : port the delegated status here, not in stakepage
            return (
                <div className="center-middle">
                    <CoffeeLoading size="large" />
                </div>
            )
        } else {
            return (
                <div>
                    <div className="active-stake-container">
                        <div className="active-stake-amount">{props.delegatedAmount / LAMPORTS_PER_SAFE}</div>
                        <div className="active-stake-state">safe in <b>{props.delegatedStatus}</b> staking</div>
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


    function returnCorrectUrlForNetwork() {
        const network = localStorage.getItem('network')
        if (network === "https://api.devnet.solana.com") {
            return (
                <div>
                    <a href={'https://explorer.solana.com/tx/' + DelegSign + '?cluster=devnet'}>See on explorer</a>
                </div>
            );
        } else if (network === "https://api.mainnet-beta.safecoin.org") {
            return (
                <div>
                    <a href={'https://explorer.safecoin.org/tx/' + DelegSign}>See on explorer</a>
                </div>
            );
        }
    }


    function returnDelegationInfoOnce() {
        var one = "one";
        //
        return (
            <div>
                <div className={styles.alertconfirmed}>

                    <div>
                        <div className={styles.successbadge}>DELEGATION SUCCESS</div>
                    </div>
                    <div>

                        {returnCorrectUrlForNetwork()}
                    </div>

                </div>
                <div className={styles.onetimefx}>
                    <div className="active-stake-container">
                        <div className="active-stake-amount">{props.delegatedAmount / LAMPORTS_PER_SAFE}</div>
                        <div className="active-stake-state">safe in <b>activating</b> staking</div>
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
                    {returnProgressEpoch(one)}
                </div>
            </div>
        )

    }

    /*   useEffect(() => {
           DelegationHub();
       })*/

    function DelegationHub(loadDelegStatus) {

        /*  if (props.status === null) {
              return (
                  <div>rentinfos & initialize info</div>
              )
          } */
        console.log("Delegation.js - Delegation Hub loadDelegStatus ", loadDelegStatus)

        if (DelegConfAmount !== null) {
            // it means that there is always a listener to the confirmation variable
            return (
                <div>
                    <LiveConfirmation
                        status={loadDelegStatus}
                        sign={DelegSign}
                        confAmount={DelegConfAmount}
                        confStatus={DelegConfStatus}
                    />
                </div>
            )
        } else {
            if (DelegConfStatus === "finalized") {
                // this condition only show once after delegation
                console.log("Delegation.js - COMPLETE TRIGGERED ", loadDelegStatus)
                return (
                    returnDelegationInfoOnce()

                )
            } else if (props.status === "INITIALIZED" || props.delegatedStatus === "inactive") {
                return (
                    returnDelegationSelect()
                )
            }

            else if (props.status === "DELEGATED") {
                return (
                    returnDelegationInfo()
                )
            }
        }


    }
    // if props.status == null return initialization & rent
    // if props.status == initialized return select a validator
    // if props.status == delegated return delegation infos status
    return (
        <Card styleName='staking-delegation' cardContent={
            <div>
                <div>{DelegationHub(loadDelegStatus)}</div>
            </div>
        }></Card>
    );
}

export default Delegation;