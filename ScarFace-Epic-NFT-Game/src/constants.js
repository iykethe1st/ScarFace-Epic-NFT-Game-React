const CONTRACT_ADDRESS = '0x17d73655243A2c1d1ce4f42035D3dCc899A8b035';

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    health: characterData.health.toNumber(),
    maxHealth: characterData.maxHealth.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
  };
};

export {CONTRACT_ADDRESS, transformCharacterData};
