import { LAMPORTS_PER_SAFE } from "@safecoin/web3.js";

export function aHrefSeeOnExplorer(signature) {
    const network = localStorage.getItem('network')
    if (network === "https://api.devnet.solana.com") {
        return (
            <div>
                 <div className="toast-txt-succes">Success !</div>
                 <a className="toast-href" href={'https://explorer.solana.com/tx/' + signature + '?cluster=devnet'}>See on explorer</a>
            </div>
        );
    } else if (network === "https://api.mainnet-beta.safecoin.org") {
        return (
            <div>
                <div className="toast-txt-succes">Success !</div>
                <a className="toast-href" href={'https://explorer.safecoin.org/tx/' + signature}>See on explorer</a>
            </div>
        );
    }
}
export function aFeesForNetwork() {
    const network = localStorage.getItem('network')
    var lamfees;
    if (network === "https://api.devnet.solana.com") {
        lamfees = 5000;
    } else {
        lamfees = 100000;
    }
    return lamfees;
}

export function aIamportForNetwork() {
    const network = localStorage.getItem('network')
    var lamnet;
    if (network === "https://api.devnet.solana.com") {
        lamnet = 1000000000;
    } else {
        lamnet = 1000000000;
    }
    return lamnet;
}

export function aSafePriceForAmount(amount) {
    const safeprice = localStorage.getItem("safeprice");
    return (safeprice * amount).toFixed(2);
}
export function aStoreContacts(addlabel, address) {
    var trimedforlabel = aTrimAddress(address);
    if (localStorage.getItem("contacts") === "" || localStorage.getItem("contacts") === null) {
        // init by adding first contact
        var firstContact = [{ value: address, label: addlabel + trimedforlabel }];
        localStorage["contacts"] = JSON.stringify(firstContact);
    } else {
        var stored_datas = JSON.parse(localStorage["contacts"]);
        stored_datas.push({ value: address, label: addlabel + trimedforlabel });
        localStorage["contacts"] = JSON.stringify(stored_datas);
    }
}
export function aGetContacts() {
    if (localStorage.getItem("contacts") !== "" && localStorage.getItem("contacts") !== null) {
        var stored_datas = JSON.parse(localStorage["contacts"]);
        return stored_datas;
    }
}
export const aSelCustomStyles = {
  option: (provided, state) => ({
    ...provided,
    borderBottom: '1px dotted #c1c1c1',
    cursor:'pointer',
    color: state.isSelected ? 'white' : '#927198',
    padding: 8,
  }),
  control: (provided, state) => ({
    ...provided,
    border: "1px solid #e8e8e8",
   /* background: "#927198",
    color: 'white',*/
    borderColor: state.isFocused ? "#927198" : "#927198", 
    boxShadow: 'none',
    '&:hover': {
        border: '1px solid #927198',
    }
  }),
 /*singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';

    return { ...provided, opacity, transition };
  }*/
}
export function aTrimAddressEnd(longaddress) {
    var firstschar = longaddress.substr(0, 6);
    return (" " + firstschar + " \u00B7\u00B7\u00B7");
}

function aTrimAddress(longaddress) {
    var firstschar = longaddress.substr(0, 4);
    var lastchar = longaddress.substr(-4);
    return (" " + firstschar + " \u00B7\u00B7\u00B7 " + lastchar);
}