import * as web from '@safecoin/web3.js';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

export async function GenerateEncrypted(userpwd : string, mnemonic : string) {
    var zebi;
    // localstorage array : key : account = encrypted : true, 
    const seed = await bip39.mnemonicToSeed(mnemonic); // look like secret key
    const derivedSeed = deriveSeed(seed);
    var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
    console.log("executed from wKeypair ", seed);

}

function deriveSeed(seed : any) {
    // you can create others derive path from wallet.safecoin.org
    const path44Change = `m/44'/19165'/0'/0'`;
    return derivePath(path44Change, seed).key;
}