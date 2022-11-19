import { useState } from "react";
import { ethers } from "ethers";
// This is the way to interact with IPFS client to
// upload and download files to the IPFS network
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

// Sets the IPFS client to the infura gateway
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreateItem() {
  // Here we save the file URL state
  const [fileUrl, setFileUrl] = useState(null);
  // Here we save the form input state with the data of the NFT
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  // This function is called when the user selects a file
  async function onChange(e) {
    // Gets the file from the event
    const file = e.target.files[0];
    try {
      const added = await client.add(
        // This is the file that we are going to upload to IPFS
        file,
        {
          // This is the progress function that is called
          // every time a chunk of the file is uploaded
          progress: (prog) => console.log(`received: ${prog}`),
        }
      );
      // Gets the URL of the file that was uploaded to IPFS
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      // Sets the file URL state
      setFileUrl(url);
    } catch (error) {
      console.log(error);
    }
  }

  async function createItem() {
    // Get the data from the form input
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    // Stringify the fields
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      // Upload the data to IPFS
      const added = await client.add(data);
      // Gets the URL of the file that was uploaded to IPFS
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      // The url is going to be the token URL of the NFT
      createSale(url);
    } catch (error) {
      console.log(error);
    }
  }

  async function createSale() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    // Create the token
    let transaction = await contract.createToken(fileUrl);
    // Await the transaction to succed
    let tx = await transaction.wait();

    // Get the event from the transaction
    // Get the transatcion event
    let event = tx.events[0];
    // This is the token in big number data type
    let value = event.args[2];
    // Transform the value in to a number data type
    let tokenId = value.toNumber();

    // Transform the price to wei
    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    // Create the market item to put the item to sell
    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    // Await the transaction to succed
    await transaction.wait();
    router.push("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Matic"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        <button
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
          onClick={createItem}
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
}
