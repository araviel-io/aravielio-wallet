// reference : https://github.com/solana-labs/solana-web3.js/blob/982dd0c9efe8b48e26f2dc96a09abe7975b16911/test/stake-program.test.js#L25
import * as web from '@safecoin/web3.js';
import { Authorized, Lockup } from '@safecoin/web3.js';
import { genMnemonic, wKeypair } from './connection';
import { ForceSignatureFromException } from './transfert'
import { aIamportForNetwork } from './arafunc';

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
    stakePubkey: stakekeypair.publicKey,
    authorizedPubkey: authkeypair.publicKey,
  });
  var needsign = await web.sendAndConfirmTransaction(connection, deactivate, [authkeypair], {
    commitment: 'single',
    skipPreflight: true,
  })
    .then(
      function (signature) {
        // console.log("tx-id: "+TransactionSignature); 
        console.log("**wDesactivate promise : ", signature)
        return signature;
      })
    .catch((e) => {
      console.log("**wDesactivate promise ERROR", e)
    });
  return needsign;
}

// withdraw only account balance, not related to any other status 
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
    lamports: minimumAmount,
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

export async function wgetStakeRewardList(stakeaddress) {
  const epochInfo = await connection.getEpochInfo();
  const actualEpoch = epochInfo.epoch;
  const stakePubkey = new web.PublicKey(stakeaddress);

  // include into loop / array.push
  /* const getRewards = await connection.getInflationReward([stakePubkey], actualEpoch - 1)
   const getPostBalance = getRewards[0].postBalance / aIamportForNetwork();
   const getRewardAmount = getRewards[0].amount / aIamportForNetwork();
   const getConcernedEpoch = getRewards[0].epoch;*/

  const linestoShow = 8;
  const array = [];
  try {
    for (let i = 1; i < linestoShow; i += 1) {
      const getRewards = await connection.getInflationReward([stakePubkey], actualEpoch - i)
      const getPostBalance = getRewards[0].postBalance / aIamportForNetwork();
      const getRewardAmount = getRewards[0].amount / aIamportForNetwork();
      const getConcernedEpoch = getRewards[0].epoch;

      var fixedPostBalance = parseFloat(getPostBalance).toFixed(2);
      var fixedRewardAmount = parseFloat(getRewardAmount).toFixed(2);
      array.push({ postbalance: fixedPostBalance, amount: fixedRewardAmount, epoch: getConcernedEpoch });


    }
  } catch (e) {
    console.log(e.message)
  }

  //console.log("comstakefound", array)
  /*console.log("getRewards : ", getRewards)
  console.log("getPostBalance : ", getPostBalance)
  console.log("getRewardAmount : ", getRewardAmount)*/
  // create human readable object
  return array;
}



// don't use it, find a proper way
export async function getValidatorInfos() {
  const CONFIG_PROGRAM_ID = new web.PublicKey('Config1111111111111111111111111111111111111');
  const voteAccounts = await connection.getVoteAccounts();
  const validatorInfoAccounts = await connection.getParsedProgramAccounts(CONFIG_PROGRAM_ID);
  const activeVoteAcc = voteAccounts.current;
  // const activeVoteAccCom = voteAccounts.current;
  const activeLength = activeVoteAcc.length;
  const key = 1;
  const array2 = [];
  var ValInfoShift = validatorInfoAccounts.slice(1);
  const valInfoLength = ValInfoShift.length;
// x address * all active validators 
  console.log("ValInfoShiftValInfoShiftValInfoShift ", ValInfoShift)
  for (let i = 0; i < valInfoLength; i += 1) {
    console.log("allo")
    // check if pubkey from validatorInfoAccounts is found in the activeVoteAcc array
    const tempInfoPubkeyArr = ValInfoShift[i].account.data.parsed.info.keys[key].pubkey;
    const nameval = ValInfoShift[i].account.data.parsed.info.configData.name
    const tempActive = activeVoteAcc[i].nodePubkey;

    for (let a = 0; a < activeLength; a += 1) {
      console.log("nested")

      if (tempInfoPubkeyArr[i] === tempActive[a]) {
        array2.push({ pubkey: tempActive, name: nameval });
      }
    }

  }

  console.log("getValidatorInfos purified array", array2)
  /*
    console.log(validatorInfoAccounts.length);
    return validatorInfoAccounts.flatMap(validatorInfoAccount => {
      const validatorInfo = web.ValidatorInfo.fromConfigData(validatorInfoAccount.account.data);
      console.log("ALARM ALARM FDP : ", validatorInfo)
      return validatorInfo ? [validatorInfo] : [];
    })*/
  //console.log("VALIDATOR INFOS : ", validatorInfoAccounts)
}

export async function wgetMyVoterInfo(votePubkey) {
  const CONFIG_PROGRAM_ID = new web.PublicKey('Config1111111111111111111111111111111111111');
  const votekey = new web.PublicKey(votePubkey);

  const votePubkeytoIdentity = await connection.getParsedAccountInfo(votekey);
  const finalvoteidentity = votePubkeytoIdentity.value.data.parsed.info.nodePubkey;

  const validatorInfoAccounts = await connection.getParsedProgramAccounts(CONFIG_PROGRAM_ID);
  
  var ValInfoShift = validatorInfoAccounts.slice(1);
  const valInfoLength = ValInfoShift.length;

  //console.log("stake.js votePubkeytoIdentity: ", finalvoteidentity)
  const array = [];

  for (let i = 0; i < valInfoLength; i += 1) {
    const tempInfoPubkeyArr = ValInfoShift[i].account.data.parsed.info.keys[1].pubkey;
    
    //console.log("stake.js voteDataInfo: ", voteDataInfo)
    if (finalvoteidentity === tempInfoPubkeyArr) {
      const voteDataInfo =  ValInfoShift[i].account.data.parsed.info.configData;
      array.push({ keybaseUsername: voteDataInfo.keybaseUsername, name: voteDataInfo.name, website: voteDataInfo.website  });
      //console.log("FOND THIS IDENTITY ON INFO ", voteDataInfo)
    }
  }
  console.log("ALL VALIDATOR INFO ", array)
  return array;
}