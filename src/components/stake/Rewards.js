import React from 'react'
import { useState } from 'react';
import { wgetStakeRewardList } from '../../utils/stake';

function Rewards(props) {

    const [ArrRewardList, setArrRewardList] = useState(null);

    if (ArrRewardList === null) {
        wgetStakeRewardList(props.stakeadd).then(function (result) {
            setArrRewardList(result);
        });
    }


    return (
        <div>
            <div className="settings-row">
                <div className="settings-title">REWARDS PAGE {props.stakeadd} </div>
            </div>
        </div>
    );
}

export default Rewards;