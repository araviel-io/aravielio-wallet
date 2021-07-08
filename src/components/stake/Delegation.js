import { Link } from 'react-router-dom';
import Card from '../common/Card';
import React from 'react';

function Delegation(props) {
// if initialized > show this component
/// if not delegated display :
/// + validator selection list
/// + summary of the staking instruction
/// + approx time of activation duration (epoch)
/// if delegated display :
/// + show amount & APY + rewards
/// actual validator
    return (
        <Card styleName='staking' cardContent={
            <div>
                
            </div>
        }>
        </Card>
    );
   }

export default Delegation;