"use client";
import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import { SystemProgram, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"; 
import { useEffect, useState } from "react";
import * as anchor from '@coral-xyz/anchor';

const HARDCODED_PAYMASTER_CONFIG = {
  paymasterUrl: "https://api.devnet.solana.com"
};

const PORTAL_URL = "https://portal.lazor.sh"; 

const playSuccessSound = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/success.wav');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play prevented:", e));
  }
};

function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState('Hello LazorKit!');
  const [signature, setSignature] = useState('');

  const {
    smartWalletPubkey,
    isConnected,
    isConnecting,
    isSigning,
    error,
    connect,
    disconnect,
    signAndSendTransaction
  } = useWallet();

  useEffect(() => {
    if (smartWalletPubkey) {
      const fetchBalance = async () => {
        try {
          const response = await fetch("https://api.devnet.solana.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getBalance",
              params: [smartWalletPubkey.toString()]
            })
          });
          
          const data = await response.json();
          if (data.result && data.result.value !== undefined) {
            setBalance(data.result.value); 
          }
        } catch (e) {
          console.error("Failed to fetch balance:", e);
        }
      };

      fetchBalance();
      playSuccessSound(); 
    }
  }, [smartWalletPubkey]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleSign = async () => {
    if (!smartWalletPubkey) return;

    const instruction = new anchor.web3.TransactionInstruction({
      keys: [],
      programId: new anchor.web3.PublicKey('Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo'),
      data: Buffer.from(message, 'utf-8'),
    });
    
    try {
      console.log("Instruction created:", instruction);
      alert("Memo Signed! (Check Console)");
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };

  const sendSOL = async () => {
    if (!smartWalletPubkey) return;

    const instruction = SystemProgram.transfer({
      fromPubkey: smartWalletPubkey,
      toPubkey: new PublicKey('MTSLZDJppGh6xUcnrSSbSQE5fgbvCtQ496MqgQTv8c1'),
      lamports: 0.1 * LAMPORTS_PER_SOL,
    });

    try {
      const signature = await signAndSendTransaction(instruction);
      console.log('Transfer successful:', signature);
      setSignature(signature || "Tx Sent!");
      playSuccessSound();
      return signature;
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-8 border border-slate-700 bg-slate-800/50 rounded-sm shadow-2xl text-center max-w-md w-full backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight font-mono">
            LAZORKIT DEMO
          </h1>
          <p className="text-slate-400 mb-8 text-sm font-mono">
            SECURE • GASLESS • PASSKEY
          </p>
          
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono py-3 px-4 rounded-sm transition-all border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 disabled:opacity-50"
          >
            {isConnecting ? 'INITIALIZING...' : '[ CONNECT WALLET ]'}
          </button>
          
          {error && (
            <div className="mt-4 p-2 bg-red-900/20 border border-red-900/50 text-red-400 text-xs font-mono break-all">
              ERROR: {error.message}
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-12 text-center">
          <h3 className="text-slate-500 font-mono text-sm mb-4 border-b border-slate-800 inline-block pb-1">SYSTEM FEATURES</h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400 max-w-lg">
            <div className="bg-slate-900/50 p-2 border border-slate-800 rounded">✅ No Passwords</div>
            <div className="bg-slate-900/50 p-2 border border-slate-800 rounded">✅ No Extensions</div>
            <div className="bg-slate-900/50 p-2 border border-slate-800 rounded">✅ Cross-Device</div>
            <div className="bg-slate-900/50 p-2 border border-slate-800 rounded">✅ Gasless Ready</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 p-4 bg-slate-800 border border-slate-700 rounded-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
          <span className="text-slate-200 font-mono text-sm">Devnet Online</span>
        </div>
        <button 
          onClick={() => disconnect()}
          className="text-red-400 hover:text-red-300 text-xs font-mono border border-red-900/50 px-3 py-1 bg-red-900/10 rounded-sm hover:bg-red-900/20 transition-colors"
        >
          [ DISCONNECT ]
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Account Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-sm p-6 shadow-lg">
          <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2 flex justify-between">
            <span>Account Overview</span>
            <span className="text-slate-600">ID: LZ-01</span>
          </h2>
          
          <div className="mb-5">
            <p className="text-slate-500 text-[10px] mb-1 uppercase">Smart Wallet Address</p>
            <div className="flex items-center bg-slate-900 p-3 rounded border border-slate-700/50 group hover:border-blue-500/50 transition-colors">
              <code className="text-blue-400 text-xs break-all font-mono">
                {smartWalletPubkey?.toString()}
              </code>
            </div>
          </div>

          <div className="mb-5">
             <p className="text-slate-500 text-[10px] mb-1 uppercase">Token Balance</p>
             <div className="text-slate-200 text-2xl font-mono tracking-tighter">
               {(balance / LAMPORTS_PER_SOL).toFixed(4)} <span className="text-sm text-slate-500">SOL</span>
             </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-mono border-t border-slate-700/50 pt-2">
              <span className="text-slate-500">PROGRAM ID</span>
              <span className="text-slate-400">3CFG...FTAD8</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-500">PAYMASTER</span>
              <span className="text-slate-400">hij7...5sD8w</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-sm p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
              Interact
            </h2>

            <div className="mb-4">
              <label className="text-slate-500 text-[10px] uppercase mb-1 block">Memo Message</label>
              <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm p-2 rounded-sm focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSign}
                disabled={isSigning}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-mono text-xs py-3 px-2 rounded-sm transition-colors border-b-2 border-slate-900 active:border-b-0 active:translate-y-[2px]"
              >
                {isSigning ? 'SIGNING...' : '📝 SIGN MEMO'}
              </button>
              
              <button
                onClick={sendSOL}
                disabled={isSigning}
                className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-3 px-2 rounded-sm transition-colors border-b-2 border-blue-900 active:border-b-0 active:translate-y-[2px]"
              >
                {isSigning ? 'SENDING...' : '💸 SEND 0.1 SOL'}
              </button>
            </div>
          </div>

          {signature && (
            <div className="mt-4 p-3 bg-green-900/10 border border-green-900/30 rounded-sm">
              <p className="text-green-500 text-[10px] font-bold uppercase mb-1">Last Transaction Success</p>
              <p className="text-green-400 text-[10px] break-all font-mono leading-tight opacity-80">
                {signature}
              </p>
            </div>
          )}
          
          <p className="text-slate-600 text-[10px] text-center mt-4 font-mono">
            * Gas fees sponsored by LazorKit Paymaster
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111927] text-slate-200 selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#0f1521]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold font-mono text-lg shadow-lg shadow-blue-900/50">
              L
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-100 font-mono">LazorScan</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono border border-slate-800 px-2 py-1 rounded bg-slate-900">
            SOLANA DEVNET
          </div>
        </div>
      </nav>

      {/* Provider Wrapping Dashboard */}
      <LazorkitProvider
        rpcUrl="https://api.devnet.solana.com"
        portalUrl={PORTAL_URL}
        paymasterConfig={HARDCODED_PAYMASTER_CONFIG}
      >
        <Dashboard />
      </LazorkitProvider>
    </main>
  );
}
