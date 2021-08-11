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
    console.log("USE STATE TEST", ArrRewardList)
    return (
        <div>
            {ArrRewardList.map((person, index) => (
                <p key={index}>{person.amount}</p>
            ))}
        </div>
    );
}

export default Rewards;