import React from 'react';

//import Container from '../../components/common/Container'
import Title from '../../components/common/Title';
import Card from '../../components/common/Card';
import QRCode from 'qrcode.react';
function ReceivePage(props) {

    return (
        <div>
            <Title titleHeader='Receive'/>
            <Card cardContent={
                <div>
                    <div className="receive-qr-code-container">
                        <QRCode value={localStorage.getItem('pubkey')} />
                    </div>
                    <div className="receive-address-container">
                        <div className="receive-address">{localStorage.getItem('pubkey')}</div>
                    </div>
                    
                </div>
            }>
            </Card>
      </div>
    );
   }

export default ReceivePage;