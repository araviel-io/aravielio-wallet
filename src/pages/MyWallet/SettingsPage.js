import React from 'react'
import Select from 'react-select'
//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';

function SettingsPage(props) {


    const handleNetworkChange = (event) => {
        console.log(event)
        if (event.value === 'mainnet-beta') {
            localStorage.setItem('network', "https://api.mainnet-beta.safecoin.org");
            //setGenre({value: 'rock', label: 'Rock'})
        } else if (event.value === 'testnet') {
            localStorage.setItem('network', "https://testnet.safecoin.org");
            //setGenre({value: 'country', label: 'Country'})
        } else if (event.value === 'devnet') {
            localStorage.setItem('network', "https://devnet.safecoin.org");
        } else {
            localStorage.setItem('network', "https://api.devnet.solana.com");
        }
        console.log(localStorage.getItem('network'))
    }

    const options = [
        { value: 'mainnet-beta', label: 'Safe Mainnet' },
        { value: 'testnet', label: 'Safe testnet' },
        { value: 'devnet', label: 'Safe devnet' },
        { value: 'soldevnet', label: 'SOL devnet' }
    ]

    return (
        <div>
            <Title titleHeader='Settings' />
            <Card cardContent={
                <div>
                    <div className="settings-row">
                        <div className="settings-title">Cluster</div>
                        <div className="settings-action-container">
                            <Select isSearchable={false} onChange={handleNetworkChange} options={options} defaultValue={options[0]} />
                        </div>

                    </div>
                    <div className="settings-row">
                        <div className="settings-title">Backup account</div>
                        <div className="settings-action-container">
                            <div className="card-button-settings">Backup</div>
                        </div>
                    </div>
                    <div className="settings-row">
                        <div className="settings-title">Delete account</div>
                        <div className="settings-action-container">
                            <div className="card-button-settings">Clear cache</div>
                        </div>
                    </div>
                </div>
            }>
            </Card>
        </div>
    );
}

export default SettingsPage;