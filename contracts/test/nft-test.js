const { expect } = require("chai");

describe("NFT", async function () {
  this.timeout(600 * 1000);
  it("should be able to mint, transferFrom, burn. And it should return name, symbol, totalSupply, tokenURI, ownerOf, balanceOf", async function () {
    const [signer, badSigner] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    await nft.deployed();
    console.log(`nft deploy tx: https://goerli.etherscan.io/tx/${nft.deployTransaction.hash}`);
    console.log(`greeter contract address: ${nft.address}`);

    // before initial minting
    expect(await nft.name()).to.equal("NFT Survey Proto");
    expect(await nft.symbol()).to.equal("NFTSP");
    expect(await nft.totalSupply()).to.equal(0);

    // mint tokenId = 0
    const mint0Tx = await nft.connect(signer).mint(signer.address);
    await mint0Tx.wait([confirms = 2]);
    console.log(`mint 0 tx: https://goerli.etherscan.io/tx/${mint0Tx.hash}`);

    // Assertion for token(tokenId = 0)
    expect(await nft.totalSupply()).to.equal(1);
    expect(await nft.tokenURI(0)).to.equal("https://asia-northeast1-nft-survey.cloudfunctions.net/api/v1/tokens/0")
    expect(await nft.ownerOf(0)).to.equal(signer.address);
    expect(await nft.balanceOf(signer.address)).to.equal(1);

    // mint tokenId = 1
    const mint1Tx = await nft.connect(signer).mint(signer.address);
    await mint1Tx.wait([confirms = 2]);
    console.log(`mint 1 tx: https://goerli.etherscan.io/tx/${mint1Tx.hash}`);

    // Assertion for token(tokenId = 1) and contract state
    expect(await nft.totalSupply()).to.equal(2);
    expect(await nft.tokenURI(1)).to.equal("https://asia-northeast1-nft-survey.cloudfunctions.net/api/v1/tokens/1")
    expect(await nft.ownerOf(1)).to.equal(signer.address);
    expect(await nft.balanceOf(signer.address)).to.equal(2);

    // transfer token(tokenId = 1) from signer.address to badSigner.address
    const transfer1FromSignerToAddressTx = await nft.connect(signer).transferFrom(signer.address, badSigner.address, 1);
    await transfer1FromSignerToAddressTx.wait([confirms = 2]);
    console.log(`transfer1FromSignerToAddress tx: https://goerli.etherscan.io/tx/${transfer1FromSignerToAddressTx.hash}`);

    // Assertion for transfered token(tokenId = 1)
    expect(await nft.totalSupply()).to.equal(2);
    expect((await nft.ownerOf(1))).to.equal(badSigner.address);
    expect(await nft.balanceOf(signer.address)).to.equal(1);
    expect(await nft.balanceOf(badSigner.address)).to.equal(1);

    // burn token(tokenId = 0)
    const burn0Tx = await nft.burn(0);
    await burn0Tx.wait([confirms = 2]);
    console.log(`burn0 tx: https://goerli.etherscan.io/tx/${burn0Tx.hash}`);

    // Assertion for burned token(tokenId = 0)
    expect(await nft.totalSupply()).to.equal(1);
    expect(nft.ownerOf(0)).to.revertedWith("ERC721: owner query for nonexistent token");
    expect(nft.tokenURI(0)).to.revertedWith("ERC721Metadata: URI query for nonexistent token");
    expect(await nft.balanceOf(signer.address)).to.equal(0);

    // mint token(tokenId = 2)
    const mint2Tx = await nft.mint(badSigner.address);
    await mint2Tx.wait([confirms = 2]);
    console.log(`mint 2 tx: https://goerli.etherscan.io/tx/${mint2Tx.hash}`);

    // Assertion for re-minted token(tokenId = 0)
    expect(await nft.totalSupply()).to.equal(2);
    expect(await nft.ownerOf(2)).to.equal(badSigner.address);
    expect(await nft.tokenURI(2)).to.equal("https://asia-northeast1-nft-survey.cloudfunctions.net/api/v1/tokens/2");
    expect(await nft.balanceOf(badSigner.address)).to.equal(2);

    // trasfer token(tokenId = 2) from badSigner.address to signer.address
    const transfer2FromBadSignerToSignerAddressTx = await nft.connect(badSigner).transferFrom(badSigner.address, signer.address, 2);
    await transfer2FromBadSignerToSignerAddressTx.wait([confirms = 2]);
    console.log(`transfer2FromBadSignerToSignerAddress tx: https://goerli.etherscan.io/tx/${transfer2FromBadSignerToSignerAddressTx.hash}`);

    // Assert for trasfered token(tokenId = 2)
    expect(await nft.totalSupply()).to.equal(2);
    expect(await nft.ownerOf(2)).to.equal(signer.address);
    expect(await nft.balanceOf(signer.address)).to.equal(1);
    expect(await nft.balanceOf(badSigner.address)).to.equal(1);

    // Assert fail to mint with badSigner who has not minter role
    expect(nft.connect(badSigner).mint(signer.address)).to.revertedWith("ERC721PresetMinterPauserAutoId: must have minter role to mint");
  });
});
