import * as web from '@safecoin/web3.js';
import { wKeypair } from './connection';
import { aFeesForNetwork } from './arafunc';
const getNetwork = localStorage.getItem('network')
const connection = new web.Connection(getNetwork, 'max');
const mnAuth = localStorage.getItem('mnemonic')
const fees = aFeesForNetwork();

export function ForceSignatureFromException(exception) {
   //FIXME: move to arafunc
    var exsignature = exception.substring(
        exception.indexOf("Transaction ") + 12, 
        exception.lastIndexOf(" failed")
    );
    console.log("+++ ForceSignatureFromException : ", exsignature)
    return exsignature;
}

export async function tTransfertSafe(minimumAmount, recipient) {
    var amountToLam = minimumAmount  * web.LAMPORTS_PER_SAFE;
    var authkeypair = await wKeypair(mnAuth);
    var recipientpkp = new web.PublicKey(recipient)
    var transaction = new web.Transaction().add(
        web.SystemProgram.transfer({
            fromPubkey: authkeypair.publicKey,
            toPubkey: recipientpkp,
            lamports: amountToLam - fees,
        })
    );
    console.log("recipientpkprecipientpkp", recipientpkp)
    var needsign = await web.sendAndConfirmTransaction(connection, transaction, [authkeypair], {
      commitment: 'single',
      skipPreflight: true,
    }).then(
      function (signature) {
        console.log("**TransfertSafe promise : ", signature)
        return signature;
      })
      .catch((e) => {
        var test = e.message;
        var exsignature = ForceSignatureFromException(test)
        console.log("*exsignature TransfertSafe", exsignature)
        return exsignature;
      });
    return needsign;
}
