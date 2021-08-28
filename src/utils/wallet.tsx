import { Keypair, Account } from '@safecoin/web3.js';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import * as bip32 from 'bip32';
import { derivePath } from 'ed25519-hd-key';
import { randomBytes, secretbox } from 'tweetnacl';
import bs58 from 'bs58';
import { pbkdf2 } from 'crypto';
import { EventEmitter } from 'events';

export const walletSeedChanged = new EventEmitter();
/*
export async function GenerateEncrypted(userpwd: string, mnemonic: string) {
    var zebi;
    // localstorage array : key : account = encrypted : true, 
    const seed = await bip39.mnemonicToSeed(mnemonic); // look like secret key
    const derivedSeed = deriveSeed(seed);
    var keypair = new Keypair(nacl.sign.keyPair.fromSeed(derivedSeed));
    console.log("executed from wKeypair ", seed);
    return keypair;
}

function deriveSeed(seed: any) {
    // you can create others derive path from wallet.safecoin.org
    const path44Change = `m/44'/19165'/0'/0'`;
    return derivePath(path44Change, seed).key;
}
*/

export async function generateMnemonicAndSeed() {
    const bip39 = await import('bip39');
    const mnemonic = bip39.generateMnemonic(256);
    const seed = await bip39.mnemonicToSeed(mnemonic);
    return { mnemonic, seed: Buffer.from(seed).toString('hex') };
}

let unlockedMnemonicAndSeed = (() => {
    const stored = JSON.parse(
        sessionStorage.getItem('unlocked') ||
        localStorage.getItem('unlocked') ||
        'null',
    );
    if (stored === null) {
        return {
            mnemonic: null,
            seed: null,
            importsEncryptionKey: null,
            derivationPath: null,
        };
    }
    return {
        importsEncryptionKey: deriveImportsEncryptionKey(stored.seed),
        ...stored,
    };
})();


// from https://github.com/Fair-Exchange/spl-token-wallet/blob/master/src/utils/wallet-seed.js
export async function storeMnemonicAndSeed(
    mnemonic: any,
    seed: any,
    password: any,
    derivationPath: any,
) {
    const plaintext = JSON.stringify({ mnemonic, seed, derivationPath });
    if (password) {
        const salt = randomBytes(16);
        const kdf = 'pbkdf2';
        const iterations = 100000;
        const digest = 'sha256';
        const key: any[number] = await deriveEncryptionKey(password, salt, iterations, digest);
        const nonce = randomBytes(secretbox.nonceLength);
        const encrypted = secretbox(Buffer.from(plaintext), nonce, key);
        localStorage.setItem(
            'locked',
            JSON.stringify({
                encrypted: bs58.encode(encrypted),
                nonce: bs58.encode(nonce),
                kdf,
                salt: bs58.encode(salt),
                iterations,
                digest,
            }),
        );
        localStorage.removeItem('unlocked');
        sessionStorage.removeItem('unlocked');
    } else {
        localStorage.setItem('unlocked', plaintext);
        localStorage.removeItem('locked');
        sessionStorage.removeItem('unlocked');
    }
    const importsEncryptionKey = deriveImportsEncryptionKey(seed);
    setUnlockedMnemonicAndSeed(
        mnemonic,
        seed,
        importsEncryptionKey,
        derivationPath,
    );
}

// looks like it's only for locked ?
export async function loadMnemonicAndSeed(password: any, stayLoggedIn: any) {
    const {
        encrypted: encodedEncrypted,
        nonce: encodedNonce,
        salt: encodedSalt,
        iterations,
        digest,
    } = JSON.parse(localStorage.getItem('locked')!); // try to get it only if it's not null
    const encrypted = bs58.decode(encodedEncrypted);
    const nonce = bs58.decode(encodedNonce);
    const salt = bs58.decode(encodedSalt);
    const key: any = await deriveEncryptionKey(password, salt, iterations, digest);
    const plaintext = secretbox.open(encrypted, nonce, key);
    if (!plaintext) {
        throw new Error('Incorrect password');
    }
    const decodedPlaintext = Buffer.from(plaintext).toString();
    const { mnemonic, seed, derivationPath } = JSON.parse(decodedPlaintext);
    if (stayLoggedIn) {
        sessionStorage.setItem('unlocked', decodedPlaintext);
    }
    const importsEncryptionKey = deriveImportsEncryptionKey(seed);
    setUnlockedMnemonicAndSeed(
        mnemonic,
        seed,
        importsEncryptionKey,
        derivationPath,
    );
    return { mnemonic, seed, derivationPath };
}

export function getAccountFromSeed(
    seed: string,
    walletIndex: any,
    dPath = undefined,
    accountIndex = 0,
) {
    const derivedSeed: any = deriveSeed(seed, walletIndex, dPath, accountIndex);
    return new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
}

export function getUnencryptedAccountFromSeed(seed: string, walletIndex: any, dPath = undefined, accountIndex = 0) {

    const derivedSeed: any = deriveSeed(seed, walletIndex, dPath, accountIndex);
    return new Keypair(nacl.sign.keyPair.fromSeed(derivedSeed));
}

export function testFromBordel() {

    const { seed } = getUnlockedMnemonicAndSeed();

    const seedBuffer: any = Buffer.from(seed, 'hex');

    let address = getAccountFromSeed(seedBuffer, 0).publicKey;
    //let name = localStorage.getItem(`name${walletIndex}`);
    //return { index: walletIndex, address, name };
    console.log("WALLET V2 ADDRESS", address)

}


export function getUnlockedMnemonicAndSeed() {
    return unlockedMnemonicAndSeed;
}

export function hasLockedMnemonicAndSeed() {
    return !!localStorage.getItem('locked');
}

export const DERIVATION_PATH = {
    deprecated: undefined,
    bip44: 'bip44',
    bip44Change: 'bip44Change',
};

// Returns the 32 byte key used to encrypt imported private keys.
function deriveImportsEncryptionKey(seed: any) {
    // SLIP16 derivation path.
    return bip32.fromSeed(Buffer.from(seed, 'hex')).derivePath("m/10016'/0")
        .privateKey;
}

async function deriveEncryptionKey(password: any, salt: any, iterations: any, digest: any) {
    return new Promise((resolve, reject) =>
        pbkdf2(
            password,
            salt,
            iterations,
            secretbox.keyLength,
            digest,
            (err, key) => (err ? reject(err) : resolve(key)),
        ),
    );
}

function setUnlockedMnemonicAndSeed(
    mnemonic: any,
    seed: any,
    importsEncryptionKey: any,
    derivationPath: any,
) {
    unlockedMnemonicAndSeed = {
        mnemonic,
        seed,
        importsEncryptionKey,
        derivationPath,
    };
    walletSeedChanged.emit('change', unlockedMnemonicAndSeed);
}




function deriveSeed(seed: any, walletIndex: any, derivationPath: any, accountIndex: any) {
    switch (derivationPath) {
        case DERIVATION_PATH.deprecated:
            const path = `m/19165'/${walletIndex}'/0/${accountIndex}`;
            return bip32.fromSeed(seed).derivePath(path).privateKey;
        case DERIVATION_PATH.bip44:
            const path44 = `m/44'/19165'/${walletIndex}'`;
            return derivePath(path44, seed).key;
        case DERIVATION_PATH.bip44Change:
            const path44Change = `m/44'/19165'/${walletIndex}'/0'`;
            return derivePath(path44Change, seed).key;
        default:
            throw new Error(`invalid derivation path: ${derivationPath}`);
    }
}