import { Link } from 'react-router-dom';

import React from 'react';

function NavCreateRestore(props) {
    return (
        <div className="wallet--nav">
            <div className="wallet-nav-action">
                <Link to="/">Create new wallet</Link>
            </div>
            <div className="wallet-nav-action">
                <Link to="/restore">Restore wallet</Link>
            </div>
        </div>
    );
   }

export default NavCreateRestore;