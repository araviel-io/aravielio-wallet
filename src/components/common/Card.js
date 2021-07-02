import React from 'react';

function Card(props) {
    return (
        <div className={`card ${ props.styleName }`}>
            <div className="card--content">
                    {/* // content can be mnemonic text to copy ( ex textbox Component) */}
                    {props.cardContent}
            </div>
        </div>
    );
   }

export default Card;