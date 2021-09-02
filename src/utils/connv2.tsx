import * as safecoin from '@safecoin/web3.js';
import { getAccountFromSeed } from './wallet';
//get public key from mnemonic
export async function wgetPubKey(seed : string) {
    // Account creation is completely local. Mainnet connection is used for getting balance and signing transaction
    const keypair = getAccountFromSeed(seed, 0);

    return keypair.publicKey;
}