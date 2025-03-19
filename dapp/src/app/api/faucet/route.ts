import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";

const faucetABI = [
  {
    inputs: [],
    name: "MAX_AMOUNCT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "receipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "requestTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
export async function POST(request: NextRequest) {
  try {
    const { recipient, amount } = await request.json();

    if (!recipient || !amount || !ethers.isAddress(recipient)) {
      return new NextResponse(JSON.stringify({ error: "Invalid Address." }), { status: 400 });
    }

    const requestedAmount = ethers.parseEther(amount.toString());
    const maxAmount = ethers.parseEther("0.00003");
    if (requestedAmount > maxAmount) {
      return new NextResponse(JSON.stringify({ error: "Max Request Amount exceed 0.00003 ETH." }), { status: 400 });
    }

    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

    const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY!, provider);

    const faucetContract = new ethers.Contract(process.env.FAUCET_CONTRACT_ADDRESS!, faucetABI, wallet);

    const tx = await faucetContract.requestTokens(recipient, requestedAmount);
    await tx.wait();
    return new NextResponse(JSON.stringify({ message: "Transaction Success", txHash: tx.hash })); /*트랜잭션 - 포스트맨에서 이제부터 시간이 조금씩 걸린다. */

    /*return new NextResponse(JSON.stringify({ recipient, amount }));  첫번째 한거  if문 없이 - 요청 확인*/

    /*console.log(provider); 2번째 provider 콘솔 */

    /*console.log(process.env.SEPOLIA_RPC_URL); 세번째 - 요청 콘솔 확인 */

    /*console.log(wallet.address);  4번째 - 요청 지갑 콘솔 */

    /*console.log(faucetContract); 5번째 faucet 콘솔*/
  } catch (error: any) {
    console.error("Faucet API Error:", error);

    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
