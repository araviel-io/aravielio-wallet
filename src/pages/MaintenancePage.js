import React from 'react';
import Title from '../components/common/Title';
import Card from '../components/common/Card';

function MaintenancePage(props) {


    return (
        <div>
            <Title titleHeader='Maintenance' />
            <Card cardContent={
                <div>
                  Api appears ton be down
                </div>
            }>
              
            </Card>
        </div>
      );
}


export default MaintenancePage;