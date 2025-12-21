import Web3 from "web3";

class Web3Service{
    web3: Web3;
    public constructor(){
       this.web3 = new Web3('https://rpc2.sepolia.org');
    }
}

export default new Web3Service();