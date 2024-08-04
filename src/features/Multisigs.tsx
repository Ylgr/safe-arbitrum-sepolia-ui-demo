"use client";

import {ethers} from "ethers";
import React from "react";
import Safe, {
    ContractNetworkConfig,
    ContractNetworksConfig,
    SafeAccountConfig,
    SafeFactory,
    SafeProvider
} from "@safe-global/protocol-kit";
import Image from "next/image";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";

const EXECUTOR_PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY
const SIGNER_PRIVATE_KEY_1 = process.env.NEXT_PUBLIC_PRIVATE_KEY_1
const SIGNER_PRIVATE_KEY_2 = process.env.NEXT_PUBLIC_PRIVATE_KEY_2
const SIGNER_PRIVATE_KEY_3 = process.env.NEXT_PUBLIC_PRIVATE_KEY_3
// const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
const RPC_URL = `https://sepolia-rollup.arbitrum.io/rpc`
// const RPC_URL = `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`

const Multisigs = () => {
    const wallet1 = new ethers.Wallet(SIGNER_PRIVATE_KEY_1)
    const wallet2 = new ethers.Wallet(SIGNER_PRIVATE_KEY_2)
    const wallet3 = new ethers.Wallet(SIGNER_PRIVATE_KEY_3)
    const [safeAddress, setSafeAddress] = React.useState<string | null>(null)
    // const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contractNetwork: ContractNetworkConfig = {
        safeSingletonAddress: '0x29fcB43b46531BcA003ddC8FCB67FFE91900C762',
        safeProxyFactoryAddress: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
        multiSendAddress: '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526',
        multiSendCallOnlyAddress: '0x9641d764fc13c8B624c04430C7356C1C7C8102e2',
        fallbackHandlerAddress: '0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99',
        signMessageLibAddress: '0xd53cd0aB83D845Ac265BE939c57F53AD838012c9',
        createCallAddress: '0x9b35Af71d77eaf8d7e40252370304687390A1A52',
        simulateTxAccessorAddress: '0x3d4BA2E0884aa488718476ca2FB8Efc291A46199',
    }
    const contractNetworks: ContractNetworksConfig = {421614: contractNetwork} // Arbitrum sepolia chainid = 421614

    const init = async () => {
        const safeProvider = new SafeProvider({ provider: RPC_URL, signer: EXECUTOR_PRIVATE_KEY as string })
        // const chainId = await safeProvider.getChainId()
        // const safeContract = await safeProvider.getSafeContract({safeVersion: '1.4.1'});
        // console.log('safeContract.target: ', await safeContract.getAddress())

        const safeFactory = await SafeFactory.init({
            provider: RPC_URL,
            signer:  EXECUTOR_PRIVATE_KEY as string,
            contractNetworks: contractNetworks,
            safeVersion: '1.4.1',
        })
        const safeAccountConfig: SafeAccountConfig = {
            owners: [wallet1.address, wallet2.address, wallet3.address],
            threshold: 2,
        }
        const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig)
        // const deploySafeResult = await safeFactory.deploySafe({safeAccountConfig, options: {gasLimit: 20000000,
        //         gasPrice: 5000000000}})
        // console.log('deploySafeResult: ', await deploySafeResult.getAddress())
        setSafeAddress(safeAddress)
    }

    const execute = async () => {
        if(!safeAddress) {
            alert('Please init the safe first')
            return
        }
        const protocolKit = await Safe.init({
            provider: RPC_URL,
            signer: EXECUTOR_PRIVATE_KEY as any,
            safeAddress: safeAddress,
            contractNetworks
        })
        let safeTransaction = await protocolKit.createTransaction({
            transactions: [
                {
                    to: '0xeaBcd21B75349c59a4177E10ed17FBf2955fE697',
                    value: '0',
                    data: '0x'
                },
                {
                    to: '0xF4402fE2B09da7c02504DC308DBc307834CE56fE',
                    value: '0',
                    data: '0x'
                }
            ]
        });
        console.log('safeTransaction: ', safeTransaction)

        const protocolKit1 = await Safe.init({
            provider: RPC_URL,
            signer: SIGNER_PRIVATE_KEY_1 as any,
            safeAddress: safeAddress,
            contractNetworks
        })
        safeTransaction = await protocolKit1.signTransaction(safeTransaction)
        const protocolKit2 = await Safe.init({
            provider: RPC_URL,
            signer: SIGNER_PRIVATE_KEY_2 as any,
            safeAddress: safeAddress,
            contractNetworks
        })
        safeTransaction = await protocolKit2.signTransaction(safeTransaction)
        console.log('safeTransaction: ', safeTransaction)
        const txResponse = await protocolKit.executeTransaction(safeTransaction)
        await txResponse.transactionResponse?.wait()
        console.log('txResponse: ', txResponse)
    }

    return (
        <>
            <AppHeader/>
            <main className="flex w-screen">
                <AppSidebar/>
                {/*<div className="p-4 sm:ml-64">*/}
                    <div className="flex flex-col w-full px-16">
                        <h3 className="m-4">Wallet 1 address: {wallet1.address}</h3>
                        {/*<br/>*/}
                        <h3>Wallet 2 address: {wallet2.address}</h3>
                        {/*<br/>*/}
                        <h3>Wallet 3 address: {wallet3.address}</h3>
                        <br/>
                        <h5>Threshold 2 of 3:</h5>
                        <br/>
                        <h2>Safe wallet address: {safeAddress ? safeAddress :
                            <button onClick={() => init()}>Init</button>}</h2>
                        <br/>
                        <button onClick={() => execute()}>Execute transaction</button>
                    </div>
                {/*</div>*/}
            </main>
        </>

    );
}

export default Multisigs;
