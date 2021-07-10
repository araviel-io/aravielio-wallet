import { Link } from 'react-router-dom';
import Card from '../common/Card';
import React from 'react';
import  { wgetVoteAcc } from '../../utils/connection'

async function listVotesAccounts() {
    const voteacc = await wgetVoteAcc();
    console.log("VOTE ACCOUNTS :", voteacc);
    return voteacc;
}

function Delegation(props) {
// if initialized > show this component
/// if not delegated display :
/// + validator selection list
/// + summary of the staking instruction
/// + approx time of activation duration (epoch)
/// if delegated display :
/// + show amount & APY + rewards
/// actual validator

listVotesAccounts();
const options = [
    { value: 'mainnet-beta', label: 'Safe Mainnet' },
    { value: 'testnet', label: 'Safe testnet' },
    { value: 'devnet', label: 'Safe devnet' },
    { value: 'soldevnet', label: 'SOL devnet' }
  ]

  console.log("TEST ARRAY :", options);

    return (
        <Card styleName='staking-delegation' cardContent={
            <div>
                Select a validator...
            </div>
        

        
        }></Card>
    );
   }

export default Delegation;