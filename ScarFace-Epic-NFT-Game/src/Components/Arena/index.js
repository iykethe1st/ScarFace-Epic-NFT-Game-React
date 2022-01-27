import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from '../../Components/LoadingIndicator';


// pass inin our characterNFT metadata so we can make a cool card in our UI
const Arena = ({ characterNFT, setCharacterNFT }) => {
  // declare the state
  const [gameContract, setGameContract] = useState(null);
  // state for Boss metadata
  const [boss, setBoss] = useState(null);
  // We are going to use this to add a bit of fancy animations during attacks
  const [attackState, setAttackState] = useState('');
  // Toast state management
  const [showToast, setShowToast] = useState(false);
  // actions
  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking %s...', boss.name);
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();

        console.log('attackTxn:', attackTxn);
        setAttackState('hit!');
        // Set the toast state to true and then false 5 seconds later
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.log('Error attacking boss:', error);
      setAttackState('');
    }
  };
  // useEffects
  useEffect(() => {
    //setup async function that will get the boss from our contract
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log("Boss:", bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };
    // logic when this event is fired off
    const onAttackComplete = (newBossHealth, newPlayerHealth) => {
      const bossHealth = newBossHealth.toNumber();
      const playerHealth = newPlayerHealth.toNumber();
      console.log(`Attack successfull! Boss health: ${bossHealth} Player health: ${playerHealth}`);
      // update both player and boss health in UI
      setBoss((prevState) => {
        return {...prevState, health: bossHealth};
      });

      setCharacterNFT((prevState) => {
        return {...prevState, health: playerHealth}
      });
    };

    if (gameContract) {
      fetchBoss();
      gameContract.on('AttackComplete', onAttackComplete);
    }
    // Make sure to clean up this event when this component is removed
    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete);
      }
    }
  }, [gameContract]);
  // useEffects
  useEffect(() => {
    const {ethereum} = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicGame.abi, signer);

      setGameContract(gameContract);
    } else {
      console.log("Ethereum object not found!")
    }
  }, []);
  return (
    <div className="arena-container">
    {/* Add your toast HTML right here */}
    {boss && characterNFT && (
      <div id="toast" className={showToast ? 'show' : ''}>
        <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
      </div>
    )}
     {/* Replace your Boss UI with this */}
     {boss && (
       <div className="boss-container">
         <div className={`boss-content ${attackState}`}>
           <h2>🔥 {boss.name} 🔥</h2>
           <div className="image-content">
             <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
             <div className="health-bar">
               <progress value={boss.health} max={boss.maxHealth} />
               <p>{`${boss.health} / ${boss.maxHealth} HP`}</p>
             </div>
           </div>
         </div>
         <div className="attack-container">
           <button className="cta-button" onClick={runAttackAction}>
             {`💥 Attack ${boss.name}`}
           </button>
         </div>
         {/* Add this right under your attack button */}
      {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Attacking ⚔️</p>
        </div>
      )}
       </div>
     )}

     {/* Replace your Character UI with this */}
    {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Your Character</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.health} max={characterNFT.maxHealth} />
                <p>{`${characterNFT.health} / ${characterNFT.maxHealth} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
            </div>
          </div>
        </div>
        {/* <div className="active-players">
          <h2>Active Players</h2>
          <div className="players-list">{renderActivePlayersList()}</div>
        </div> */}
      </div>
    )}
   </div>
  );
};
export default Arena;
