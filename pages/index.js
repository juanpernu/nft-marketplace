import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    // Ether provider to retrive data from the blockchain
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.maticvigil.com"
    );
    // Reference to the actual token smart contract
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    // Reference to the actual market smart contract
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    // Array of all the unsold items in the marketplace
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        // Call the token contract by tokenURI usinng the id
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        // Make the get request to the tokenUri (This returns a JSON object)
        const meta = await axios.get(tokenUri);
        // This is the price item property in the JSON object made by the smart contract
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        // Format the price to a format we can use
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    // Sets the new array to the sate
    setNfts(items);
    // Sets the state to loaded
    setLoadingState("loaded");
  }

  async function buyNft(nft) {
    // Look for the instance of Ethereum in the browser
    const web3Modal = new Web3Modal();
    // If the user is connected, we will have a connection
    const connection = await web3Modal.connect();
    // Create a provider with Web3provider using the connection of the user
    const provider = new ethers.providers.Web3Provider(connection);

    // Create a signer using the provider
    const signer = provider.getSigner();
    // Create a reference to the market contract using the signer (the wallet address of the user)
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    // Reference of the price using the nft
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    // Use the createMarketSale function from the smart contract
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      }
    );
    // Wait until the transaction is executed
    await transaction.wait();
    // Reload the NFTs
    loadNFTs();
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;

  return (
    <div className="flex justify-center">
      <div className="p-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} />
              <div className="p-4">
                <p style={{ height: "64px" }} className="text-2xl font-bold">
                  {nft.name}
                </p>
                <div style={{ height: "70px", overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="p-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">
                  {nft.price} Matic
                </p>
                <button
                  onClick={() => buyNft(nft)}
                  className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
