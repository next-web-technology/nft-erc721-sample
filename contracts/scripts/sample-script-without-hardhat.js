const { ethers } = require("ethers");
const contractJsonData = require("../artifacts/contracts/Greeter.sol/Greeter.json");

async function main() {
  const provider = ethers.getDefaultProvider(
    "goerli",
    {
      infura: process.env.INFURA_PROJECT_ID,
      alchemy: process.env.ALCHEMY_API_TOKEN,
      etherscan: process.env.ETHERSCAN_API_TOKEN,
    }
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contractFactory = new ethers.ContractFactory(contractJsonData.abi, contractJsonData.bytecode, wallet);

  console.log("greeting contract deploy start with 'Hello, world!'");
  const contract = await contractFactory.deploy("Hello, world!");
  console.log(`greeting contract deploy tx hash: ${contract.deployTransaction.hash}`);
  console.log(`greeting contract deploy tx link: https://goerli.etherscan.io/tx/${contract.deployTransaction.hash}`);
  console.log("waiting for greeting contract deploy tx confirmed...");
  await contract.deployTransaction.wait([confirms = 1]);
  console.log("greeting contract deploy tx confirmed");
  const contractAddress = contract.address
  console.log(`greeting contract address: ${contractAddress}`);

  const deployedContract = new ethers.Contract(contractAddress, contractJsonData.abi, provider);

  console.log(`current greeting message is ${await deployedContract.greet()}`);

  console.log("send tx to call setGreeting")
  const setGreetingTx = await deployedContract.connect(wallet).setGreeting("Hola, mundo!");
  console.log(`setGreeting tx hash: ${setGreetingTx.hash}`);
  console.log(`setGreeting tx link: https://goerli.etherscan.io/tx/${setGreetingTx.hash}`);
  console.log("waiting for setGreeting tx confirmed...");
  await setGreetingTx.wait([confirms = 1]);
  console.log("setGreeting tx confirmed");

  console.log(`after changing, greeting message is ${await deployedContract.greet()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
