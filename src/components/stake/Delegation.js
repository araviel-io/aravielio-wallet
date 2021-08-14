import Card from '../common/Card';
import React from 'react';
import Select from 'react-select'
import styles from './Delegation.module.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { LAMPORTS_PER_SAFE } from '@safecoin/web3.js';
import { aSelCustomStyles } from '../../utils/arafunc';
import { wDelegate, wgetParsedAccountInfo, wgetMyVoterStats, wDesactivate, wgetMyVoterInfo } from '../../utils/stake';
import { wgetVoteAcc, wgetCurrentEpoch, wgetRemainingTime, wgetInflation, wgetSignatureConfirmation } from '../../utils/connection'
import { Line } from 'rc-progress';
import { HourglassOutline } from 'react-ionicons'
import { CoffeeLoading } from 'react-loadingg';

import LiveConfirmation from '../../components/transfert/LiveConfirmation';
import Rewards from './Rewards';
function Delegation(props) {

    const [NodeArray, setNodeArray] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    // getAccountinfo area
    const [voter, setvoter] = useState(null);
    const [voterCom, setvoterCom] = useState(null);
    const [voterInfos, setvoterInfos] = useState([]);
    const [voterTotStake, setvoterTotStake] = useState(null);

    const [epochProgress, setepochProgress] = useState(null);
    const [remainingTime, setremainingTime] = useState(null);

    /* const [ActivationEpoch, setActivationEpoch] = useState(null);
 
     const [stakeAuthority, setstakeAuthority] = useState(null);
     const [withdrawAuthority, setwithdrawAuthority] = useState(null);*/

    //setinterval master signature
    const [loadDelegStatus, setloadDelegStatus] = useState(null);
    const [DelegSign, setDelegSign] = useState(null);
    const [DelegConfAmount, setDelegConfAmount] = useState(null);
    const [DelegConfStatus, setDelegConfStatus] = useState(null);

    const [instructionType, setinstructionType] = useState(null);
    const [toggleValorReward, settoggleValorReward] = useState("validatorinfo");

    const [apy, setApy] = useState(null);
    //wgetMyVoterStats(voter);

    useEffect(() => {
        if (NodeArray !== undefined && props.status !== "DELEGATED") {
            wgetVoteAcc()
                .then(
                    function (valistl) {
                        setNodeArray([valistl]);
                    })
                .catch((e) => { console.log("error", e) });
        }

        wgetInflation()
            .then(
                function (result) {
                    setApy(result);
                })
            .catch((e) => { console.log("error", e) });
    }, [])

    const valist = NodeArray[0];
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
        setinstructionType("delegate")
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
                            setDelegConfAmount(signArray[0].amount)
                            setDelegConfStatus(signArray[0].label)
                            if (signArray[0].label === "finalized") {
                                clearInterval(interval);
                            }
                        })
                }, 1000)
                setloadDelegStatus("complete")
            });
    }

    function tryToDeactivate() {
        setinstructionType("deactivate")
        setloadDelegStatus("requesting")
        wDesactivate()
            .then(function (undelegsign) {
                const interval = setInterval(() => {
                    wgetSignatureConfirmation(undelegsign)
                        .then(function (signArray) {
                            setloadDelegStatus("processing")
                            setDelegConfAmount(signArray[0].amount)
                            setDelegConfStatus(signArray[0].label)
                            if (signArray[0].label === "finalized") {
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
    function returnUnDelegLoading() {
        //FIXME: instead of text, returns whole control with according disabled state
        if (loadDelegStatus === "requesting" || loadDelegStatus === "sent" || loadDelegStatus === "processing" || loadDelegStatus === "complete") { return ("...") }
        else { return ("Deactivate") }
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
                                </div>
                                <div>
                                    <div className="pre-delegation-summary-container">
                                        <div className="stake-numb-grid">Stake amount : <b>{props.balance} SAFE</b></div>
                                        <div className="stake-numb-grid">APY : <b>{apy} %</b></div>
                                        <div className="stake-numb-grid">V.COM : <b>{voterCom} %</b></div>
                                    </div>
                                    <div className="stake-activation-eta-container"><HourglassOutline color={'#00000'} height="40px" width="40px" />
                                        <div className="stake-activation-eta-info">
                                            your staking will be effective in approx.<br /> <b>{remainingTime}</b> hours after delegation.
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
                    <Select placeholder="Select or search a validator..." className="input-react-select" styles={aSelCustomStyles} isSearchable={true} options={valist} onChange={handleSelectedNode} />
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
                setvoter(voter);
                console.log("** wgetParsedAccountInfo().then(function (result) : ", voter);
            }).catch((e) => { console.log("getParsedAccountInfo ", e) });
            wgetCurrentEpoch().then(function (result) {
                setepochProgress(result)
            }).catch((e) => { console.log("Delegation.js - wgetCurrentEpoch ", e) });

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
                var votercom = result[0].com;
                var voterstake = result[0].stake;
                var voterstakeTolam = voterstake / LAMPORTS_PER_SAFE;
                setvoterCom(votercom);
                setvoterTotStake(voterstakeTolam.toFixed(1));
            }).catch((e) => {
                console.log("Delegation.js - wgetMyVoterStats ", e)
            });
        }
    }, [voter]) 
    useEffect(() => {
        if (voter != null) {
            wgetMyVoterInfo(voter).then(function (tagrandmere) {
   /*             var votercom = result[0].com;
                var voterstake = result[0].stake;
                var voterstakeTolam = voterstake / LAMPORTS_PER_SAFE;
                setvoterCom(votercom);
                setvoterTotStake(voterstakeTolam.toFixed(1));*/
                console.log("VOTER INFOS WALLAH wgetMyVoterInfo", tagrandmere)
                setvoterInfos(tagrandmere);
            }).catch((e) => {
                console.log("Delegation.js - wgetMyVoterStats ", e)
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
        // https://keybase.io/_/api/1.0/user/lookup.json?usernames=araviel
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
                    <div className="stake-numbers">
                        <div className="card-button-center" onClick={() => { tryToDeactivate() }}>{returnUnDelegLoading()}</div>
                    </div>
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

    function returnDelegationInfoOnce(isType) {
        var one = "one";
        //
        return (
            <div>
                <div className={styles.alertconfirmed}>
                    <div>
                        <div className={styles.successbadge}>{isType} SUCCESS</div>
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

    function DelegationHub(loadDelegStatus) {
        // every conditions here are loaded from refresh by props nad live (instructions) by usestates
        //console.log("Delegation.js - Delegation Hub loadDelegStatus ", loadDelegStatus)

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
                // add a condition instructionType
                if (instructionType === "delegate") {
                    return (
                        returnDelegationInfoOnce(instructionType)
                    )
                } else if (instructionType === "deactivate") {
                    return (
                        returnDelegationSelect()
                    )
                }

            } else if (props.status === "INITIALIZED" || props.delegatedStatus === "inactive") {
                return (
                    returnDelegationSelect()
                )
            }

            else if (props.status === "DELEGATED") {
                if (toggleValorReward === "validatorinfo") {
                    return (
                        returnDelegationInfo()
                    )
                } else {

                    return (
                        returnDelegationInfo()
                    )
                }

            }
        }
    }

    const [activeIndex, setActiveIndex] = useState(0);

    const handleOnClick = index => {
        setActiveIndex(index); // remove the curly braces
        if (index === 0) { settoggleValorReward("validatorinfo") }
        if (index === 1) { settoggleValorReward("rewards") }
    };

    const label = ["Validator info", "Rewards"]
    const navigation = label.map((el, index) => {
        return (
            <div
                key={index}
                onClick={() => handleOnClick(index)} // pass the index
                className={activeIndex === index ? "sni-active" : "sni-unactive"}
            >
                {el}
            </div>
        );
    });

    return (
        <div>
            {props.status === "DELEGATED" ?
                    <div className="sub-navigation-card">
                        {navigation}
                    </div>
                :
                <></>
                }

            <Card styleName='staking-delegation' cardContent={
                <div>
                    {toggleValorReward === "validatorinfo" ? <div>{DelegationHub(loadDelegStatus)}</div> : <Rewards stakeadd={props.stakeadd} />}
                </div>
            }></Card>
        </div>
    );
}

export default Delegation;