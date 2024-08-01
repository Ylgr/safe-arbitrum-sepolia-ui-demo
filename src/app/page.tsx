"use client";

import Image from "next/image";
import {ethers} from "ethers";
import Safe, {
    ContractNetworksConfig,
    ContractNetworkConfig,
    SafeProvider,
    SafeAccountConfig, SafeFactory
} from "@safe-global/protocol-kit";
import React from "react";

const EXECUTOR_PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY
const SIGNER_PRIVATE_KEY_1 = process.env.NEXT_PUBLIC_PRIVATE_KEY_1
const SIGNER_PRIVATE_KEY_2 = process.env.NEXT_PUBLIC_PRIVATE_KEY_2
const SIGNER_PRIVATE_KEY_3 = process.env.NEXT_PUBLIC_PRIVATE_KEY_3
// const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
const RPC_URL = `https://sepolia-rollup.arbitrum.io/rpc`
// const RPC_URL = `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
export default function Home() {
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
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
                <h3>Wallet 1 address: {wallet1.address}</h3>
                {/*<br/>*/}
                <h3>Wallet 2 address: {wallet2.address}</h3>
                {/*<br/>*/}
                <h3>Wallet 3 address: {wallet3.address}</h3>
                <br/>
                <h5>Threshold 2 of 3:</h5>
                <br/>
                <h2>Safe wallet address: {safeAddress ? safeAddress : <button onClick={() => init()}>Init</button>}</h2>
                <br/>
                <button onClick={() => execute()}>Execute transaction</button>
            </div>

            <div
                className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
                <Image
                    className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                    src="/next.svg"
                    alt="Next.js Logo"
                    width={180}
                    height={37}
                    priority
                />
            </div>

            {/*<div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">*/}
            {/*    <a*/}
            {/*        href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"*/}
            {/*        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"*/}
            {/*        target="_blank"*/}
            {/*        rel="noopener noreferrer"*/}
            {/*    >*/}
            {/*        <h2 className="mb-3 text-2xl font-semibold">*/}
            {/*            Docs{" "}*/}
            {/*            <span*/}
            {/*                className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">*/}
            {/*  -&gt;*/}
            {/*</span>*/}
            {/*        </h2>*/}
            {/*        <p className="m-0 max-w-[30ch] text-sm opacity-50">*/}
            {/*            Find in-depth information about Next.js features and API.*/}
            {/*        </p>*/}
            {/*    </a>*/}

            {/*    <a*/}
            {/*        href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"*/}
            {/*        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"*/}
            {/*        target="_blank"*/}
            {/*        rel="noopener noreferrer"*/}
            {/*    >*/}
            {/*        <h2 className="mb-3 text-2xl font-semibold">*/}
            {/*            Learn{" "}*/}
            {/*            <span*/}
            {/*                className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">*/}
            {/*  -&gt;*/}
            {/*</span>*/}
            {/*        </h2>*/}
            {/*        <p className="m-0 max-w-[30ch] text-sm opacity-50">*/}
            {/*            Learn about Next.js in an interactive course with&nbsp;quizzes!*/}
            {/*        </p>*/}
            {/*    </a>*/}

            {/*    <a*/}
            {/*        href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"*/}
            {/*        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"*/}
            {/*        target="_blank"*/}
            {/*        rel="noopener noreferrer"*/}
            {/*    >*/}
            {/*        <h2 className="mb-3 text-2xl font-semibold">*/}
            {/*            Templates{" "}*/}
            {/*            <span*/}
            {/*                className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">*/}
            {/*  -&gt;*/}
            {/*</span>*/}
            {/*        </h2>*/}
            {/*        <p className="m-0 max-w-[30ch] text-sm opacity-50">*/}
            {/*            Explore starter templates for Next.js.*/}
            {/*        </p>*/}
            {/*    </a>*/}

            {/*    <a*/}
            {/*        href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"*/}
            {/*        className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"*/}
            {/*        target="_blank"*/}
            {/*        rel="noopener noreferrer"*/}
            {/*    >*/}
            {/*        <h2 className="mb-3 text-2xl font-semibold">*/}
            {/*            Deploy{" "}*/}
            {/*            <span*/}
            {/*                className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">*/}
            {/*  -&gt;*/}
            {/*</span>*/}
            {/*        </h2>*/}
            {/*        <p className="m-0 max-w-[30ch] text-balance text-sm opacity-50">*/}
            {/*            Instantly deploy your Next.js site to a shareable URL with Vercel.*/}
            {/*        </p>*/}
            {/*    </a>*/}
            {/*</div>*/}
        </main>
    );
}
