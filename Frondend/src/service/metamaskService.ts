import Web3 from "web3";

class MetamaskService{
    web3: Web3;
    public constructor(){
       this.web3 = new Web3('https://rpc2.sepolia.org');
    }
}

export default new MetamaskService();