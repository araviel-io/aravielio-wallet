import React from 'react';

//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';

import {wCreateStakeAccount} from '../../utils/stake';
function StakePage(props) {
    return (
        <div>
            <Title titleHeader='Stake'/>
            <Card cardContent={
                <button onClick={wCreateStakeAccount}></button>
            }>
            </Card>
      </div>
    );
   }

export default StakePage;