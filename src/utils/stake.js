import * as web from '@safecoin/web3.js';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Authorized, Lockup } from '@safecoin/web3.js';


export async function wCreateStakeAccount() {
    const getNetwork = localStorage.getItem('network')

    const connection = new web.Connection(getNetwork, 'recent');
    const voteAccounts = await connection.getVoteAccounts();
    const voteAccount = voteAccounts.current.concat(voteAccounts.delinquent)[0];
    const votePubkey = new web.PublicKey(voteAccount.votePubkey);
  
    const from = new web.Account();
    const authorized = new web.Account();
    await connection.requestAirdrop(from.publicKey, 2 * web.LAMPORTS_PER_SAFE);
    await connection.requestAirdrop(authorized.publicKey, 2 * web.LAMPORTS_PER_SAFE);
  
    const minimumAmount = await connection.getMinimumBalanceForRentExemption(
      web.StakeProgram.space,
      'recent',
    );
  



     // Create Stake account without seed
     const newStakeAccount = new web.Account();
     let createAndInitialize = web.StakeProgram.createAccount({
       fromPubkey: from.publicKey,
       stakePubkey: newStakeAccount.publicKey,
       authorized: new Authorized(authorized.publicKey, authorized.publicKey),
       lockup: new Lockup(0, 0, new web.PublicKey(0)),
       lamports: minimumAmount + 42,
     });
 
     await web.sendAndConfirmTransaction(
       connection,
       createAndInitialize,
       [from, newStakeAccount],
       {commitment: 'single', skipPreflight: true},
     ).then( 
        function(output)
        { 
           // console.log("tx-id: "+TransactionSignature); 
            console.log("createAndInitialize : ", output)
        });
    
     var getbalance = await connection.getBalance(newStakeAccount.publicKey);
     console.log("newStakeAccount * getbalance ", getbalance)
     console.log("Address :  ", newStakeAccount.publicKey.toBase58())

     let delegation = web.StakeProgram.delegate({
       stakePubkey: newStakeAccount.publicKey,
       authorizedPubkey: authorized.publicKey,
       votePubkey,
     });
     await web.sendAndConfirmTransaction(connection, delegation, [authorized], {
       commitment: 'single',
       skipPreflight: true,
     })
     .then( 
        function(output)
        { 
           // console.log("tx-id: "+TransactionSignature); 
            console.log("delegation : ", output)
        })

}