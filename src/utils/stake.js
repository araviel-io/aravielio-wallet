// reference : https://github.com/solana-labs/solana-web3.js/blob/982dd0c9efe8b48e26f2dc96a09abe7975b16911/test/stake-program.test.js#L25
import * as web from '@safecoin/web3.js';
import { Authorized, Lockup } from '@safecoin/web3.js';
import { genMnemonic, wKeypair } from './connection';
const getNetwork = localStorage.getItem('network')
 const connection = new web.Connection(getNetwork, 'recent');
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
  console.log("stakeinfo ",stakeActivation)
  return stakeActivation;
}
// request airdrops on main account + stake account after creating them
export async function wCreateStakeAccount(mnfrom, mnauthorized, stakeacc) {
  // TODO: fund to authority otherwise not working
  // every keypairs are created from mnemonics
  const getNetwork = localStorage.getItem('network')
  // wCreateAuthKeypair();
  const connection = new web.Connection(getNetwork, 'recent');

  const from = await wKeypair(mnfrom); // always output keypair object "main" account
  const authorized = await wKeypair(mnauthorized); // always output keypair object
  const newStakeAccount = await wKeypair(stakeacc);

  //await connection.requestAirdrop(authorized.publicKey, 2 * web.LAMPORTS_PER_SAFE);

  const minimumAmount = await connection.getMinimumBalanceForRentExemption(
    web.StakeProgram.space,
    'recent',
  );

  console.log("Creating new stake account... ")
  // Create Stake account without seed
  let createAndInitialize = web.StakeProgram.createAccount({
    fromPubkey: from.publicKey,
    stakePubkey: newStakeAccount.publicKey,
    authorized: new Authorized(authorized.publicKey, authorized.publicKey),
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

  var mnAuth = localStorage.getItem('auth-mnemonic')
  var mnStake = localStorage.getItem('stake-mnemonic')

  var authkeypair = await wKeypair(mnAuth); // don't forget to right click on wKeypair > Go to definition for more
  var stakekeypair = await wKeypair(mnStake);
  const votePubkey = new web.PublicKey(selectedNode);

  let delegation = web.StakeProgram.delegate({
    stakePubkey: stakekeypair.publicKey,
    authorizedPubkey: authkeypair.publicKey,
    votePubkey,
  })
  // delegation can take some time and exceed the 30s in the devnet
  console.log("Starting delegation TX... ")
  var needsign = await web.sendAndConfirmTransaction(connection, delegation, [authkeypair], {
    commitment: 'single',
    skipPreflight: true,
  })
  .then(
    function (signature) {
      // console.log("tx-id: "+TransactionSignature); 
      console.log("**createAndInitialize promise : ", signature)
      return signature;
    })
  .catch((e) => {
      console.log("**createAndInitialize promise ERROR", e)
    });

  console.log("DELEGATION SIGNATURE MAIN RETURN : ", needsign);
  return needsign;
}

export async function wgetMyVoterStats(myvoteaddress) {
  const voteAccounts = await connection.getVoteAccounts();
  const activeVoteAcc = voteAccounts.current;
 // const activeVoteAccCom = voteAccounts.current;
  const activeLength = activeVoteAcc.length;
  const array = [];

  //console.log("first array test ", activeVoteAcc[0])
  for (let i = 0; i < activeLength; i += 1) {
     // var test = activeVoteAcc[i].votePubkey;
      console.log("---VOTE ACOOUNTS : ", activeVoteAcc)
      if (myvoteaddress === activeVoteAcc[i].votePubkey) {
        console.log("found")
        array.push({ com: activeVoteAcc[i].commission, stake: activeVoteAcc[i].activatedStake });
        console.log("comstakefound", array)
      }
     // array.push({ value: activeVoteAcc[i].votePubkey, label: activeVoteAcc[i].votePubkey + " | " + activeVoteAcc[i].commission + " % "  });
  }
  //localStorage.setItem("voteAccounts", array)
  //console.log("custom array: ",array)

  return array;
}