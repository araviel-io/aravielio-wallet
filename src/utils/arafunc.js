export function ConsoleLog(page, color, [varr]) {

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
    borderBottom: '1px dotted pink',
    color: state.isSelected ? 'white' : 'blue',
    padding: 5,
  }),
  control: (provided, state) => ({
    ...provided,
    border: "1px solid black"

  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';

    return { ...provided, opacity, transition };
  }
}

function aTrimAddress(longaddress) {
    var firstschar = longaddress.substr(0, 4);
    var lastchar = longaddress.substr(-4);
    return (" " + firstschar + " \u00B7\u00B7\u00B7 " + lastchar);
}