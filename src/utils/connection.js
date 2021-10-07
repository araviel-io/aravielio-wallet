
import * as web from '@safecoin/web3.js';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';

//var ApiUrl = web.clusterApiUrl("mainnet-beta");
localStorage.setItem('network', "https://api.mainnet-beta.safecoin.org")
const getNetwork = localStorage.getItem('network')
const connection = new web.Connection(getNetwork, "max");
const con2 = new web.Connection(getNetwork, "confirmed");
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

export async function wgetCurrentEpoch() {
    const epochInfo = await connection.getEpochInfo();
    const slotindex = epochInfo.slotIndex;
    const slotinEpochs = epochInfo.slotsInEpoch;
    const epochprogress = slotindex * 100 / slotinEpochs;
    var epochProgressTFixed = epochprogress.toFixed(0);
    return epochProgressTFixed;
    //console.log("", epochProgressTFixed)
}
export async function wgetRemainingTime() {
    // need getEpochInfo & getRecentPerformanceSamples
    const epochInfo = await connection.getEpochInfo();
    const slotindex = epochInfo.slotIndex;
    const slotinEpochs = epochInfo.slotsInEpoch;
    const slotsLeft = slotinEpochs - slotindex;
    // issue with connection.getRecentPerformanceSamples, temporary fix below :
    const response = await fetch(getNetwork, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "jsonrpc": "2.0", "id": "1", "method": "getRecentPerformanceSamples", "params": [1] })
    })
    // returns > 0: {numSlots: 119, numTransactions: 53213, samplePeriodSecs: 60, slot: 75155782}
    const data = await response.json();
    const samples = data.result[0];
    const numSlots = samples.numSlots;
    const samplePeriodSecs = samples.samplePeriodSecs;
    const _blocktime = samplePeriodSecs / numSlots;
    const secsEta = slotsLeft * _blocktime;
    const hourseta = secsEta / 3600;
    console.log("samplessamples : ", hourseta.toFixed(1))
    return hourseta.toFixed(1);
}

export async function wgetVoteAcc() {
    const voteAccounts = await connection.getVoteAccounts();
    const activeVoteAcc = voteAccounts.current;
    // const activeVoteAccCom = voteAccounts.current;
    const activeLength = activeVoteAcc.length;
    const array = [];

    for (let i = 0; i < activeLength; i += 1) {
        array.push({ value: activeVoteAcc[i].votePubkey, label: activeVoteAcc[i].votePubkey + " | " + activeVoteAcc[i].commission + " % " });
    }
    return array;
}
export async function wgetVoteAccVerTwo() {
    const voteAccounts = await connection.getVoteAccounts();
    const activeVoteAcc = voteAccounts.current;
    // const activeVoteAccCom = voteAccounts.current;
    const activeLength = activeVoteAcc.length;
    const array = [];

    for (let i = 0; i < activeLength; i += 1) {
        array.push({ value: activeVoteAcc[i].votePubkey, label: activeVoteAcc[i].votePubkey + " | " + activeVoteAcc[i].commission + " % " });
    }
    return array;
}
// don't know why i can't find getInflationRate method
export async function wgetInflation() {
    try {
        const response2 = await fetch(getNetwork, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "jsonrpc": "2.0", "id": "1", "method": "getInflationRate" })
        })
        var data2 = await response2.json();
        var _tempresult = data2.result;
        var totalinflation = _tempresult.total;
        var _totinf = parseFloat(totalinflation);
        var fixedinf = _totinf * 100;
        console.log(fixedinf.toFixed(1))
    }
    catch (e) {
        console.log(e.message)
    }
    return fixedinf.toFixed(1);
}

// placeholder
export async function wKeypair(mnemonic) {

    const seed = await bip39.mnemonicToSeed(mnemonic); // raw secret key 64
    const derivedSeed = deriveSeed(seed); // derived secret key (seed) from derivation path
    //var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
    var keypair = new web.Keypair(nacl.sign.keyPair.fromSeed(derivedSeed));
    return keypair;
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

    const lamports = 8 * 1000000000
    connection.requestAirdrop(account.publicKey, lamports).then(() => {
        console.log("airdrop done")
        instructions(connection, account)
    });
}


//get public key from mnemonic
export async function wgetPubKey(mnemonic) {
    // Account creation is completely local. Mainnet connection is used for getting balance and signing transaction
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = deriveSeed(seed);
    var account = new web.Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);

    return account.publicKey;
}
export async function wgetSignatureStatus(sign) {

    const signature = await connection.getSignatureStatus(sign);
    return signature;
}

export async function wgetSignatureConfirmation(sign) {
    // to be called at a setInterval > returns confirmations amount and MAX
    const signStatusArr = [];
    await connection.getSignatureStatus(sign)
        .then(
            function (status) {
                //parse signature and retrieve the confirmation amount
                var confAmount = status.value.confirmations;
                var confStatus = status.value.confirmationStatus;
                console.log('%c connection.js : ', 'background: #222; color: #bada55', confStatus, confAmount, status)
                signStatusArr.push({ amount: confAmount, label: confStatus });
                //return confStatus;
            })
        .catch((e) => {

        });

    return signStatusArr;
}

export async function wgetLatestTransactions(address) {
    const addresstoPubkey = new web.PublicKey(address);
    const Signs = await con2.getConfirmedSignaturesForAddress2(addresstoPubkey)
    // signature = array
    const signCount = Signs.length;
    const signatureArray = [];
    const preparedArray = []
    var parsedSign = [];

    for (let i = 0; i < signCount; i += 1) {
        parsedSign = Signs[i].signature;
        signatureArray.push(parsedSign);
    }
    // now transform signature into processable array :
    const fetchTrans = await con2.getParsedConfirmedTransactions(signatureArray)
    console.log("FETCH fetchTrans   : ", fetchTrans)
    for (let i = 0; i < signCount; i += 1) {
        try {
            const insType = fetchTrans[i].transaction.message.instructions[0].parsed.type
            // supported instructions : transfert - withdraw
            if (insType === "createAccount") {
                // don't proceed this instruction yet
            } else if (insType === "withdraw") {
                // for withdraw we need to manipulate the array a little bit differently
                const insAmount = fetchTrans[i].transaction.message.instructions[0].parsed.info.lamports;
                const insDest = fetchTrans[i].transaction.message.instructions[0].parsed.info.destination;
                const insSource = fetchTrans[i].transaction.message.instructions[0].parsed.info.voteAccount;
                preparedArray.push({ type: insType, amount: insAmount, source: insSource, destination: insDest  });
            } else {
                const insAmount = fetchTrans[i].transaction.message.instructions[0].parsed.info.lamports;
                const insDest = fetchTrans[i].transaction.message.instructions[0].parsed.info.destination;
                const insSource = fetchTrans[i].transaction.message.instructions[0].parsed.info.source;
                preparedArray.push({ type: insType, amount: insAmount, source: insSource, destination: insDest  });
            }
        } catch(e) {
            console.warn(e.message)
        }
    //const finalBal = (postBal - preBal) / web.LAMPORTS_PER_SAFE;
    //console.log("FETCH Transactions type   : ", insType)
    }

  /*  console.log("FETCH SIGNATURES parsedSign  : ", parsedSign)
    console.log("FETCH SIGNATURES  : ", fetchTrans)
    console.log("FETCH preparedArray  : ", preparedArray)*/
    return preparedArray;
}

// derivation path, should not be changed (compliant to wallet.safecoin.org)
function deriveSeed(seed) {
    // you can create others derive path from wallet.safecoin.org
    const path44Change = `m/44'/19165'/0'/0'`;
    return derivePath(path44Change, seed).key;
}
export async function wgetVersion() {
    const clusterVer = await connection.getVersion();
    return clusterVer;
}

export function genMnemonic() {
    return generateMnemonic();
}


