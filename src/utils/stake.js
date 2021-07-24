// reference : https://github.com/solana-labs/solana-web3.js/blob/982dd0c9efe8b48e26f2dc96a09abe7975b16911/test/stake-program.test.js#L25
import * as web from '@safecoin/web3.js';
import { Authorized, Lockup, Connection } from '@safecoin/web3.js';
import { genMnemonic, wKeypair } from './connection';
import { ForceSignatureFromException } from './transfert'

const getNetwork = localStorage.getItem('network')
const connection = new web.Connection(getNetwork, 'max');
// create authorized keypair from mnemonic
export function wCreateAuthKeypair() {
  // TODO: Double check
  var authmnemonic = genMnemonic();
  localStorage.setItem('auth-mnemonic', authmnemonic);
}

export function wCreateStakeKeypair() {
  var stakemnemonic = genMnemonic();
  localStorage.setItem('stake-mnemonic', stakemnemonic);
}

export async function wgetParsedAccountInfo() {

  // wCreateAuthKeypair();
  var mnStake = localStorage.getItem('stake-mnemonic')

  var stakeKP = await wKeypair(mnStake);
  var getaccountinfo = await connection.getParsedAccountInfo(stakeKP.publicKey);

  return getaccountinfo;
}
export async function wgetStakeActivation() {
  var mnStake = localStorage.getItem('stake-mnemonic')

  var stakeKP = await wKeypair(mnStake);
  var stakeActivation = await connection.getStakeActivation(stakeKP.publicKey);
  console.log("stakeinfo ", stakeActivation, "for : ", stakeKP.publicKey.toBase58())
  return stakeActivation;
}
// request airdrops on main account + stake account after creating them
export async function wCreateStakeAccount(mnfrom, stakeacc) {

  const from = await wKeypair(mnfrom); // always output keypair object "main" account
 // const authorized = await wKeypair(mnauthorized); // always output keypair object
  const newStakeAccount = await wKeypair(stakeacc);

  const minimumAmount = await connection.getMinimumBalanceForRentExemption(
    web.StakeProgram.space,
    'recent',
  );

  console.log("Creating new stake account... ")
  // Create Stake account without seed
  let createAndInitialize = web.StakeProgram.createAccount({
    fromPubkey: from.publicKey,
    stakePubkey: newStakeAccount.publicKey,
    authorized: new Authorized(from.publicKey, from.publicKey),
    lockup: new Lockup(0, 0, new web.PublicKey(0)),
    lamports: minimumAmount + 42,
  });
  console.log("*Prepare tx... ")
  var needsign = await web.sendAndConfirmTransaction(
    connection,
    createAndInitialize,
    [from, newStakeAccount],
    { commitment: 'single', skipPreflight: true },
  ).then(
    function (signature) {
      // console.log("tx-id: "+TransactionSignature); 
      console.log("**createAndInitialize promise : ", signature)
      return signature;
    })
    .catch((e) => {
      console.log("**createAndInitialize promise ERROR", e)

    });

  // this return is the return of the sendAndConfirmTransaction first .then
  return needsign;
}


export async function wDelegate(selectedNode) {
  // FIXME: use parameter for node selection
  const getNetwork = localStorage.getItem('network')
  const connection = new web.Connection(getNetwork, 'max');

  var mnAuth = localStorage.getItem('mnemonic')
  var mnStake = localStorage.getItem('stake-mnemonic')

  var authkeypair = await wKeypair(mnAuth); // don't forget to right click on wKeypair > Go to definition for more
  var stakekeypair = await wKeypair(mnStake);
  const votePubkey = new web.PublicKey(selectedNode);

  let delegation = web.StakeProgram.delegate({
    stakePubkey: stakekeypair.publicKey,
    authorizedPubkey: authkeypair.publicKey,
    votePubkey,
  })

  console.log("Starting delegation TX... ")
  var needsign = await web.sendAndConfirmTransaction(connection, delegation, [authkeypair], {
    commitment: 'single',
    skipPreflight: true,
  })
    .then(
      function (signature) {
        // console.log("tx-id: "+TransactionSignature); 
        console.log("**wDelegate promise : ", signature)
        return signature;
      })
    .catch((e) => {
      console.log("**wDelegate promise ERROR", e)
    });

  console.log("DELEGATION SIGNATURE MAIN RETURN : ", needsign);
  return needsign;
}

export async function wDesactivate() {
  var mnAuth = localStorage.getItem('mnemonic')
  var mnStake = localStorage.getItem('stake-mnemonic')

  var authkeypair = await wKeypair(mnAuth); // don't forget to right click on wKeypair > Go to definition for more
  var stakekeypair = await wKeypair(mnStake);

  let deactivate = web.StakeProgram.deactivate({
    stakePubkey: stakekeypair,
    authorizedPubkey: authkeypair.publicKey,
  });
  var needsign = await web.sendAndConfirmTransaction(connection, deactivate, [authkeypair], {
    commitment: 'single',
    skipPreflight: true,
  })
    .then(
      function (signature) {
        // console.log("tx-id: "+TransactionSignature); 
        console.log("**wDelegate promise : ", signature)
        return signature;
      })
    .catch((e) => {
      console.log("**wDelegate promise ERROR", e)
    });
  return needsign;
}

export async function wWithdrawStake(minimumAmount, recipient) {
  var mnAuth = localStorage.getItem('mnemonic')
  var mnStake = localStorage.getItem('stake-mnemonic')

  var authkeypair = await wKeypair(mnAuth); // don't forget to right click on wKeypair > Go to definition for more
  var stakekeypair = await wKeypair(mnStake);
  // get a PublicKey from address
  var recipientpkp = new web.PublicKey(recipient)

  let withdraw = web.StakeProgram.withdraw({
    stakePubkey: stakekeypair.publicKey,
    authorizedPubkey: authkeypair.publicKey,
    toPubkey: recipientpkp,
    lamports: minimumAmount + 20,
    /*
        stakePubkey: newAccountPubkey,
        authorizedPubkey: newAuthorized.publicKey,
        toPubkey: recipient.publicKey,
        lamports: minimumAmount + 20,*/

  });
  console.log("recipientpkprecipientpkp", recipientpkp)
  var needsign = await web.sendAndConfirmTransaction(connection, withdraw, [authkeypair], {
    commitment: 'single',
    skipPreflight: true,
  }).then(
    function (signature) {
      // console.log("tx-id: "+TransactionSignature); 
      console.log("**wWithdrawStake promise : ", signature)
      return signature;
    })
    .catch((e) => {
      var test = e.message;
      var exsignature = ForceSignatureFromException(test)
      console.log("*exsignature", exsignature)
      return exsignature;
    });
  return needsign;
}

export async function wgetMyVoterStats(myvoteaddress) {
  const voteAccounts = await connection.getVoteAccounts();
  const activeVoteAcc = voteAccounts.current;
  // const activeVoteAccCom = voteAccounts.current;
  const activeLength = activeVoteAcc.length;
  const array = [];

  for (let i = 0; i < activeLength; i += 1) {
    if (myvoteaddress === activeVoteAcc[i].votePubkey) {
      array.push({ com: activeVoteAcc[i].commission, stake: activeVoteAcc[i].activatedStake });
      console.log("comstakefound", array)
    }
  }

  return array;
}