import { Link } from 'react-router-dom';
import React, { Component } from 'react';



class WalletMenuItem extends Component {
    render() {
      
     /* console.log(this.props);*/
      
      return (
        <Link
          className={
            this.props.active ? "menu-nav-button mbtnactive" : "menu-nav-button"
          }
          to={this.props.href}
          onClick={this.props.onClick}
        >
          {" "}
          <div></div>
          <div className="menu-nav-button-text">{this.props.title}</div>
        </Link>
      );
    }
  }
  
  class WalletMenu extends Component {
    
    state = {
      
      active: 0 // default / refresh
    };

  


    setActive = (i) => {
      
      localStorage.setItem('location', i);
      console.log(i, this.state.active);
      this.setState({
        active: i
      });
    };
    buttons = [
      {
        title: "Wallet",
        key: 0,
        href: "/mywallet"
      },
      {
        title: "Receive",
        key: 1,
        href: "/mywallet/receive"
      },
      {
        title: "Send",
        key: 2,
        href: "/mywallet/send"
      },
      {
        title: "Stake",
        key: 3,
        href: "/mywallet/stake"
      },
      {
        title: "Settings",
        key: 4,
        href: "/mywallet/settings"
      }
    ];

    render() {
      
    

      return (
        
        <div className="menu-list-container">
         
            {this.buttons.map((button) => (
              <WalletMenuItem
                title={button.title}
                key={button.key}
                href={button.href}
                active={this.state.active === button.key}
                onClick={() => {
                  this.setActive(button.key);
                }}
                
              />
            ))}
        <div className="menu-about">Made with love by <b>araviel</b> for the <b>Safecoin</b> community</div>
        </div>
      );
    }
  }
  export default WalletMenu;

