import Web3 from "web3";
import type AddressInfo from "../interfaces/AddressInfo";

class Web3Service{
    private web3: Web3;
    private usdtAddress: string;
    public constructor(){
        this.usdtAddress  = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        this.web3 = new Web3('https://rpc2.sepolia.org');
    }
    public async GetAccountInfo(address:string) : Promise<AddressInfo | null> {
        const minERC20ABI = [{
                constant: true,
                inputs: [{name: "_owner", type: "address"}],
                name: "balanceOf",
                outputs: [{name: "balance",type: "uint256"}],
                type: "function",
            }] as const;
        if(!this.web3.utils.isAddress(address)) return null;
        try{
            const [balanceWeight, txCount] = await Promise.all([
                this.web3.eth.getBalance(address),
                this.web3.eth.getTransactionCount(address)   
            ]);
            const ethBalance = this.web3.utils.fromWei(balanceWeight,"ether");
            const contract = new this.web3.eth.Contract(minERC20ABI, this.usdtAddress);
            const usdtBalanceWeigth: bigint = await contract.methods.balanceOf(address).call();
            const usdtBalance = usdtBalanceWeigth.toString();
            const result: AddressInfo = {
                address: address,
                ethBalance: ethBalance,
                txCount: txCount, 
                usdtBalance: usdtBalance
            };
            return result;
        }
        catch(error){
            console.log(error);
            return null;
        }
    }
}

export default new Web3Service();