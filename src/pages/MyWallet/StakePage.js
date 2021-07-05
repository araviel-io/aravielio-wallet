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
                <div>
                    <p>Working but with randoms keypairs (for now) see console</p>
                    <p>you sometimes can have a timeout but that's fine</p>
                    <button onClick={wCreateStakeAccount}>Create & delegate</button>
                </div>
            }>
            </Card>
      </div>
    );
   }

export default StakePage;