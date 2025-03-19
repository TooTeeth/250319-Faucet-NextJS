// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Faucet {
    uint public MAX_AMOUNCT = 0.5 ether;

    function requestTokens(address payable  receipient, uint amount) external {
        require(amount <= MAX_AMOUNCT, "Requested amount exceeds limit.");
        require(address(this).balance >= amount, "Insufficient contract balance");

         (bool success, ) = receipient.call{value: amount}(""); /*call - 재진입 공격에 대한 방어가 필요하다.*/
         require(success, "Transfer failled");
    }

    receive() external payable { }

    /*배포 주소: 0x4f047aBE56Da69e4EdA522529dC7E9A530185dB5 */
}