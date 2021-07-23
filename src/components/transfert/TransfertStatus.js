import React from 'react';
import styles from './TransfertStatus.module.css';
import { ThreeHorseLoading } from 'react-loadingg';
import { CheckmarkCircleOutline } from 'react-ionicons'

function TransfertStatus(props) {

    function returnLoaderOrSummary() {

        if (props.status === "request" || props.status === "sent") {
            return (
                <ThreeHorseLoading />
            );
        } else if (props.status === "confirmed") {
            return (
                // return box with transaction link explorer
                <div className="flex">
                    <div>
                        <CheckmarkCircleOutline color={'#00000'} height="70px" width="70px" />
                    </div>
                    <div>
                        <a href={'https://explorer.solana.com/tx/' + props.sign + '?cluster=devnet'}>See on explorer</a>
                    </div>
                </div>
            );
        }
        return (
            // return box with transaction link explorer
            <div className="flex">
                <div>
                    <CheckmarkCircleOutline color={'#00000'} height="70px" width="70px" />
                </div>
                <div>
                    <a href={'https://explorer.solana.com/tx/' + props.sign + '?cluster=devnet'}>See on explorer</a>
                </div>
            </div>
        );
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