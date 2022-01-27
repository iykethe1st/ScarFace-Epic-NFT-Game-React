import React, {useEffect, useState} from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from '../../Components/LoadingIndicator';

const SelectCharacter = ({ setCharacterNFT }) => {
  // characters - This will hold all the character metadata we get back from our contract
  const [characters, setCharacters] = useState([]);
  // Since we are going to be using our contract in multiple spots,
  // let's just initialize it once and store it in state to use throughout our contract
  const [gameContract, setGameContract] = useState(null);
  // New minting state property we will be using
  const [mintingCharacter, setMintingCharacter] = useState(false);

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        // Show our loading indicator
        setMintingCharacter(true);
        console.log("Minting character in progress...");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log("mintTxn:", mintTxn);
        // Hide our loading indicator when minting is finished
        setMintingCharacter(false);
      }
    } catch (error){
      console.warn("mintCharacterNFTAction Error:", error);
      // If there is a problem, hide the loading indicator as well
      setMintingCharacter(false);
    }
  };

  useEffect(() => {
    const {ethereum} = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract( CONTRACT_ADDRESS, myEpicGame.abi, signer);
      //set our gameContract in state
      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found!");
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log("Getting contract characters to mint...");
        // call the contract to get all mintable characters
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log("charactersTxn:", charactersTxn);
        // go through all our characters and transform the data in a way that our UI can easily understand.
        const characters = charactersTxn.map((characterData) => transformCharacterData(characterData));
        // set all mintable characters in state
        setCharacters(characters);
      } catch (error) {
        console.log("Something went wrong, couldn't fetch characters:", error);
      }
    };
    // add a callback method tht will fire when this event is received
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(`CharacterNFTminted - sender : ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`);
      alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
    // Fetch the NFT metadata after minting and set in state
    if (gameContract) {
      const characterNFT = await gameContract.checkIfUserHasNFT();
      console.log("CharacterNFT: ", characterNFT);
      setCharacterNFT(transformCharacterData(characterNFT));
    }
  };
    // if our gameContract is ready, let's get characters!
    if (gameContract) {
      getCharacters();
      // setup CharacterNFTminted listener
      gameContract.on("CharacterNFTMinted", onCharacterMint);
    }
    return () => {
      // clean up listener when component unmounts
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [gameContract]);

  // render methods for your UI
  const renderCharacters = () => characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
      </div>
      <img src={character.imageURI} alt={character.name} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}> {`Mint ${character.name}`} </button>
    </div>
  ));

  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>
      {characters.length > 0 && (
          <div className="character-grid">{renderCharacters()}</div>
      )}
      {/* Only show our loading state if mintingCharacter is true */}
    {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator/>
          <p>Minting In Progress...</p>
        </div>
        <img
          src="https://i.imgur.com/f6VeM91.gif"
          alt="Minting loading indicator"
        />
      </div>
    )}
    </div>
  );
};
export default SelectCharacter;
