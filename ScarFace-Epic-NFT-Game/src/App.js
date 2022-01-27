// Import useEffect and useState
import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';
// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  // just a state variable we use to store our user's public wallet
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  // loading state
  const [isLoading, setIsLoading] = useState(false);
  // create a function to check if wallet is connected, this function will be "async" since it will take some time
  const checkIfWalletIsConnected = async () => {
    // first, make sure we have access to window.ethereum
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        // We set isLoading here because we use return in the next line
        setIsLoading(false);
        return;
      } else {
        console.log("We have found the etherum object", ethereum);
        // check if we're authorized to access the user's wallet
        const accounts = await ethereum.request({ method: 'eth_accounts'});
        // grab the first account since user might have multiple accounts
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found!");
        }
      }
    } catch (error) {
      console.log(error);
    }
    // We release the state property after all the function logic
    setIsLoading(false);
  };
  // render methods
  const renderContent = () => {
    // If the app is currently loading, just render out LoadingIndicator
    if (isLoading) {
      return < LoadingIndicator />;
    }
    // scenario 1, if user has not connected,
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
        <img
          src="https://i.imgur.com/UiQR9df.gif"
          alt="Monty Python Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWallet}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );
    // scenario 2, if user has connected but does not have a character NFT
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT}/>;
    // If there is a connected wallet and characterNFT, go to battle Arena
  } else if (currentAccount && characterNFT) {
    return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
  }
};
  // implement connectWallet method here
  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      // Fancy method to request access to accounts
      const accounts= await ethereum.request({
        method: 'eth_requestAccounts',
      });
      // this should print out the public address once we authorize MetaMask
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };
  // this runs our function when the page loads
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        if (window.ethereum.networkVersion !== '5') {
          alert("Please connect using the Goerli Network!")
        }
      } catch(error) {
        console.log(error);
      }
    }
    // Anytime our component mounts, make sure to immiediately set our loading state
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    // the function we will call that interacts with out smart contract
    const fetchNFTMetadata = async () => {
      console.log("Checking for character NFT on address", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer);
      // to check if there is indeed a minted character NFT
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }
      // Once we are done with all the fetching, set loading state to false
      setIsLoading(false);
    };
    // we only want to run this if we have a connected Wallet
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);



  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Havana TakeOver ⚔️</p>
          <p className="sub-text">Team up to defeat Alejandro Sosa!</p>
          <div className="connect-wallet-container">
            {renderContent()}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
