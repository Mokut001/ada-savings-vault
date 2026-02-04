import React, { useState, useEffect } from 'react';
import { initLucid } from '../lib/lucid';
import { Data } from 'lucid-cardano';
import { Wallet, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { differenceInMonths, differenceInDays, parseISO, format } from 'date-fns';

export default function SavingsDApp() {
  const [target, setTarget] = useState(1000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
  const [currentSaved, setCurrentSaved] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate Duration
  const monthsDiff = differenceInMonths(parseISO(targetDate), parseISO(startDate)) || 1;
  const daysLeft = differenceInDays(parseISO(targetDate), new Date());
  const monthlyRequired = (target - currentSaved) / monthsDiff;
  const progressPercent = Math.min((currentSaved / target) * 100, 100);

  const handleDeposit = async () => {
    setLoading(true);
    setStatus('Connecting to Cardano...');
    try {
      const lucid = await initLucid('Nami');
      const amount = (monthlyRequired) * 1000000;
      
      const datum = Data.to({
        beneficiary: lucid.utils.getAddressDetails(await lucid.wallet.address()).paymentCredential?.hash,
        targetAmount: BigInt(target * 1000000)
      });

      const tx = await lucid.newTx()
        .payToContract("SCRIPT_ADDRESS_GOES_HERE", { inline: datum }, { lovelace: BigInt(amount) })
        .complete();
        
      const signed = await tx.sign().complete();
      const hash = await signed.submit();
      setStatus(`Deposit Sent! Hash: ${hash.slice(0,12)}...`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-orange-500 mb-2">PHOENIX VAULT</h1>
          <p className="text-slate-400 font-mono tracking-widest text-sm uppercase">Smart Cardano Savings Engine</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Settings Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-orange-400">
              <Calendar size={20} /> Goal Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Target Amount (ADA)</label>
                <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} 
                       className="w-full bg-slate-800 p-4 rounded-xl text-xl font-bold border-none focus:ring-2 ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
                         className="w-full bg-slate-800 p-3 rounded-lg text-sm border-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Target Date</label>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} 
                         className="w-full bg-slate-800 p-3 rounded-lg text-sm border-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-green-400">
              <TrendingUp size={20} /> Analysis
            </h2>
            <div className="space-y-4 my-4">
              <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl">
                <span className="text-slate-400 text-sm">Monthly Installment</span>
                <span className="text-2xl font-black text-white">{monthlyRequired.toFixed(1)} <span className="text-xs">ADA</span></span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl">
                <span className="text-slate-400 text-sm">Days Remaining</span>
                <span className="text-2xl font-black text-orange-500">{daysLeft} <span className="text-xs">DAYS</span></span>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-mono text-center">
              Total Duration: {monthsDiff} Months
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-tighter">Current Savings</p>
              <h3 className="text-3xl font-black">{currentSaved} <span className="text-sm font-normal text-slate-400">/ {target} ADA</span></h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-orange-500">{progressPercent.toFixed(0)}%</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden border-4 border-slate-900">
            <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 h-full transition-all duration-1000 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                 style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 space-y-3">
          <button onClick={handleDeposit} disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-500 active:scale-95 text-white py-6 rounded-2xl font-black text-xl transition-all shadow-xl shadow-orange-950/20 uppercase">
            {loading ? 'Submitting Tx...' : `Deposit ${monthlyRequired.toFixed(1)} ADA`}
          </button>
          
          <button disabled={currentSaved < target}
                  className={`w-full py-6 rounded-2xl font-black text-xl transition-all uppercase border-2 ${
                    currentSaved >= target ? 'bg-green-600 text-white border-green-400' : 'bg-transparent text-slate-700 border-slate-800 cursor-not-allowed'
                  }`}>
            {currentSaved >= target ? '🚀 Target Met: Withdraw All' : '🔒 Goal Locked'}
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl text-center font-mono text-sm text-slate-300 animate-pulse">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}