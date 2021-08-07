import React from 'react';
import styles from './LiveConfirmation.module.css';
import { ThreeHorseLoading } from 'react-loadingg';
import { CoffeeLoading } from 'react-loadingg';
function LiveConfirmation(props) {

    function returnCorrectUrlForNetwork() {
        const network = localStorage.getItem('network')
        if (network === "https://api.devnet.solana.com") {
            return (
                <div>
                    <a href={'https://explorer.solana.com/tx/' + props.sign + '?cluster=devnet'}>See on explorer</a>
                </div>
            );
        } else if (network === "https://api.mainnet-beta.safecoin.org") {
            return (
                <div>
                    <a href={'https://explorer.safecoin.org/tx/' + props.sign}>See on explorer</a>
                </div>
            );
        }
    }

    function returnLoaderOrSummary() {
        //console.log("props.statusprops.statusprops.status : ", props.status)
        console.log('%c LiveConfirmation.js : props.status ', 'background: green; color: #bada55', props.status)
        if (props.status === "request" || props.status === "requesting" || props.status === "sent") {

            return (
                <ThreeHorseLoading />
            );

        } else if (props.status === "processing") {

            return (
                <div className={styles.confcontainer}>
                    <div className={styles.coffee}>
                        <CoffeeLoading speed="0.7" size="large" />
                    </div>
                    <div className={styles.liveconfAmount}>{props.confAmount} </div>
                    <div className={styles.staticonfAmount}> / 32</div>
                </div>
            );

        } else if (props.status === "confirmed") {

            return (
                // return box with transaction link explorer
                <div>
                    <div className="dotted-separator"></div>
                    <div className={styles.alertconfirmed}>

                        <div>
                            <div className={styles.successbadge}>SUCCESS</div>
                        </div>
                        <div>
                            <div>Transfert complete !</div>
                            {returnCorrectUrlForNetwork()}
                        </div>

                    </div>
                    <div className="dotted-separator"></div>
                </div>
            );
            //finalized
        } else if (props.status === "InsufficientFunds") {

            return (
                // return box with transaction link explorer
                <div>
                    <div className="dotted-separator"></div>
                    <div className={styles.alertconfirmed}>
                        <div>
                            <div className={styles.errorbadge}>ERROR</div>
                        </div>
                        <div>
                            <div>{props.status} </div>
                            {returnCorrectUrlForNetwork()}
                        </div>
                    </div>
                    <div className="dotted-separator"></div>
                </div>
            );
        } else if (props.status === null || props.status === undefined) {
            return (
                <div>Something gone wrong</div>
            )
        }
        return (
            <ThreeHorseLoading />
        );
    }

    return (

        <div>
            {returnLoaderOrSummary()}
        </div>
    );
}

export default LiveConfirmation;