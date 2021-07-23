import React from 'react';
import styles from './TransfertStatus.module.css';
import { ThreeHorseLoading } from 'react-loadingg';
import { CheckmarkCircleOutline, BanOutline } from 'react-ionicons'

function TransfertStatus(props) {

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
        console.log("props.statusprops.statusprops.status : ", props.status)
        if (props.status === "request" || props.status === "sent") {
            return (
                <ThreeHorseLoading />
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
        }


    }

    return (

        <div className={styles.alertcontainer}>
            <div className={styles.alertcontent}>

                {returnLoaderOrSummary()}

            </div>
        </div>

    );
}

export default TransfertStatus;