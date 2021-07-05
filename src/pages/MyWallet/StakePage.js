import React from 'react';

//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';

import {wCreateStakeAccount} from '../../utils/stake';
import { wKeypair} from '../../utils/connection'
function StakePage(props) {

    async function getAuthKeypair() {
        var mnauth = localStorage.getItem('auth-mnemonic')
        var authkeypair = await wKeypair(mnauth); // don't forget to right click on wKeypair > Go to definition for more
        console.log("Auth keypair : ", authkeypair);
    }




    return (
        <div>
            <Title titleHeader='Stake'/>
            <Card cardContent={
                <div>
                    <p>Working but with randoms keypairs (for now) see console</p>
                    <p>you sometimes can have a timeout but that's fine</p>
                    <button onClick={getAuthKeypair}>Auth Keypair</button>
                    <button onClick={wCreateStakeAccount}>Create & delegate</button>
                </div>
            }>
            </Card>
      </div>
    );
   }

export default StakePage;