
[![Build Status](https://ara.ci.clamifa.net/api/badges/araviel-io/aravielio-wallet/status.svg)](https://ara.ci.clamifa.net/araviel-io/aravielio-wallet)

# Araviel.io SafeCoin Wallet

Web Wallet for Safecoin, the Community Edition (CE) of Solana.

![alt text](https://preview.redd.it/1o5u0lwerhi71.png?width=1112&format=png&auto=webp&s=8b463dda45a104d306b8860efb99525df4edfc47)

![Easy staking on Safecoin (Solana CE)](https://i.imgur.com/8CSV5UH.gif)

**Not a production build, for now.** It's only intended for testing and dev, have fun !

### Features : 

* Create Keypar (newly Account) from seed phrase (24 words) compliant to wallet.safecoin.org derivation path (`m/44'/19165'/0'/0'`)\
* Display your receive address and a react-qr code associated with it\
* Sending\
* Stake account creation\
* Delegating / Undelegating to chosen validator\
* Change networks and features Solana airdrops for playing with balance with no harm done !

### Further development:

* Improving security and data storage\
* Tokens listing\
* Prepare for public stress test\

### Notes:

Mnemonics are directly stored in browser for now, **use at your own risk**, prefer devnet first.

## Build it yourself

If you'd rather build the application yourself, please ensure you have nodejs/npm/yarn already installed locally.

```
git clone https://github.com/araviel-io/aravielio-wallet.git 
cd aravielio-wallet
npm i
npm start // to start a development
npm run build // to create a production build 
```

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

