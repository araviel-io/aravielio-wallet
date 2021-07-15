
import * as web from '@safecoin/web3.js';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

//var ApiUrl = web.clusterApiUrl("mainnet-beta");
const getNetwork = localStorage.getItem('network')
const connection = new web.Connection(getNetwork, "max");

function generateMnemonic() {
    var mn = bip39.generateMnemonic(256);

    return mn;
}

// check if mainnet is reachable by querying the recent blockhash (bool)
export async function isApiAlive() {
    var constatus;
    await connection.getRecentBlockhash()
        .then(
            function (getRecentBlockhash) {
                constatus = true;
            })
        .catch((e) => {
            console.log("getRecentBlockhash error", e)
            constatus = false;
        });
    return constatus;
}

export async function wgetBalance(mnemonic) {
    // Account creation is completely local. Mainnet connection is used for getting balance and signing transaction
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = deriveSeed(seed);
    var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);

    var lamports = await connection.getBalance(account.publicKey);
    var totalSafe = lamports / web.LAMPORTS_PER_SAFE;
    console.log("LAMPORT PER SAFE :", web.LAMPORTS_PER_SAFE, " getBalance :", lamports)
    // console.log("account.publicKey", account.publicKey.toBase58());
    return totalSafe;
}
export async function wgetVoteAcc() {
    const voteAccounts = await connection.getVoteAccounts();
    const activeVoteAcc = voteAccounts.current;
   // const activeVoteAccCom = voteAccounts.current;
    const activeLength = activeVoteAcc.length;
    const array = [];

    console.log("first array test ", activeVoteAcc[0])
    for (let i = 0; i < activeLength; i += 1) {
        array.push({ value: activeVoteAcc[i].votePubkey, label: activeVoteAcc[i].votePubkey + " | " + activeVoteAcc[i].commission + " % "  });
    }
    //localStorage.setItem("voteAccounts", array)
    //console.log("custom array: ",array)
    return array;
}
// placeholder
export async function wKeypair(mnemonic) {

    //const mnemonic = localStorage.getItem('mnemonic')

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = deriveSeed(seed);
    var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
    //console.log("executed from wKeypair ", account.publicKey.toBase58());
    return account;
}

export async function transferSafe(destination, amount) {

    const mnemonic = localStorage.getItem('mnemonic')
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = deriveSeed(seed);
    var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);

    const tx = new web.Transaction().add(
        web.SystemProgram.transfer({
            fromPubkey: account.publicKey,
            toPubkey: destination,
            lamports: amount,
        }),
    );

    return await connection.sendTransaction(tx, [account], {
        // Default look to be the safest.

        /*  preflightCommitment: 'recent',*/
    })
        .then(
            function (TransactionSignature) {
                // console.log("tx-id: "+TransactionSignature); 
                return TransactionSignature;
            })
        .catch((e) => { console.log("error", e) });
}

function instructions(connection, account) {
    const instruction = new web.TransactionInstruction({
        keys: [],
        programId: new web.PublicKey('D8Cnv1UcThay2WijWP4SQ8G683UuVsKPaZEU7TNVKW1j'),
        data: Buffer.from('cztest'),
    });
    console.log("account:", account.publicKey.toBase58())
    web.sendAndConfirmTransaction(
        connection,
        new web.Transaction().add(instruction),
        [account],
        {
            skipPreflight: true,
            commitment: "singleGossip",
        },
    )
        .then(() => { console.log("done") })
        .catch((e) => { console.log("error", e) });
}

export async function solRequestAirdrop() {
    const mnemonic = localStorage.getItem('mnemonic')
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = deriveSeed(seed);
    var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);

    const lamports = 10 * 1000000000
    connection.requestAirdrop(account.publicKey, lamports).then(() => {
        console.log("airdrop done")
        instructions(connection, account)
    });
}

// restore account (keypair) from mnemonic phrase
export async function getAccountFromMnemonic(mnemonic) {

    // Account creation is completely local. Mainnet connection is used for getting balance and signing transaction
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = deriveSeed(seed);
    var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);

    return account;
}

//get public key from mnemonic
export async function wgetPubKey(mnemonic) {
    // Account creation is completely local. Mainnet connection is used for getting balance and signing transaction
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = deriveSeed(seed);
    var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);

    return account.publicKey;
}

// derivation path, should not be changed (compliant to wallet.safecoin.org)
function deriveSeed(seed) {
    // you can create others derive path from wallet.safecoin.org
    const path44Change = `m/44'/19165'/0'/0'`;
    return derivePath(path44Change, seed).key;
}
// below is useless, for reference only
export async function tryfetch() {

    const connection = new web.Connection("https://api.mainnet-beta.solana.com", "max");
    const ApiUrl = 'https://api.nomics.com/v1/currencies/ticker?key=601eff44ab249d337b38cbb045d7b62d&ids=SAFECOIN&interval=1h&convert=USD&per-page=5&page=1';
    var p1 = new Promise(
        // La fonction de résolution est appelée avec la capacité de
        // tenir ou de rompre la promesse
        function (resolve, reject) {


            // On tient la promesse !
            var test = resolve(ApiUrl);
            console.log(test);
            // return test
        });

    p1.then(
        // On affiche un message avec la valeur
        function (val) {
            console.log("p1 prom", val);
        }).catch(
            // Promesse rejetée
            function () {
                //  console.log("promesse rompue");
            });

}

export function genMnemonic() {
    return generateMnemonic();
}


