import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { wgetStakeRewardList } from '../../utils/stake';

function Rewards(props) {

    const [ArrRewardList, setArrRewardList] = useState(null);


    useEffect(() => {
        if (ArrRewardList === null) {
            wgetStakeRewardList(props.stakeadd).then(function (result) {
                setArrRewardList(result);
            });
        }
    }, [ArrRewardList, props.stakeadd])

    function mapBridge() {

        if (ArrRewardList != null) {
            return (
                <div className="just-flex-sbetween" >
                    <div>
                        <div>amount</div>
                        <div className="column-container">
                            {ArrRewardList.map((element, index) => (
                                <p className="amount-plus" key={index}> {element.amount}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div>balance</div>
                        <div className="column-container">
                            {ArrRewardList.map((element, index) => (
                                <p key={index}>{element.postbalance}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div>epoch</div>
                        <div className="column-container">
                            {ArrRewardList.map((element, index) => (
                                <p key={index}>{element.epoch}</p>
                            ))}
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    Loading rewards...
                </div>
            );
        }
    }

    console.log("USE STATE TEST", ArrRewardList)
    return (
        <div className="overflow-list">
            {mapBridge()}
        </div>
    );
}

export default Rewards;