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

  const monthsDiff = Math.max(1, differenceInMonths(parseISO(targetDate), parseISO(startDate)));
  const daysLeft = differenceInDays(parseISO(targetDate), new Date());
  const monthlyRequired = (target - currentSaved) / monthsDiff;
  const progressPercent = Math.min((currentSaved / target) * 100, 100);

  const handleDeposit = async () => {
    setLoading(true);
    setStatus('Contacting Wallet...');
    try {
      const lucid = await initLucid('Nami');
      const amount = (monthlyRequired) * 1000000;
      
      const datum = Data.to({
        beneficiary: lucid.utils.getAddressDetails(await lucid.wallet.address()).paymentCredential?.hash,
        targetAmount: BigInt(target * 1000000)
      });

      const tx = await lucid.newTx()
        .payToContract("addr_test1vzf68vsn3393ezd8mlln389wzax5re8s44s0ws246p322cs4w34nd", { inline: datum }, { lovelace: BigInt(amount) })
        .complete();
        
      const signed = await tx.sign().complete();
      const hash = await signed.submit();
      setStatus(`Success! Hash: ${hash.slice(0,10)}...`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-orange-500 mb-2 tracking-tight">PHOENIX VAULT</h1>
          <p className="text-slate-400 font-mono tracking-widest text-xs uppercase">Cardano Savings Protocol</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-orange-400">
              <Calendar size={18} /> Configure Goal
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Target Goal (ADA)</label>
                <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} 
                       className="w-full bg-slate-800 p-4 rounded-xl text-xl font-bold border-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Start</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
                         className="w-full bg-slate-800 p-3 rounded-lg text-xs border-none" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Target Date</label>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} 
                         className="w-full bg-slate-800 p-3 rounded-lg text-xs border-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-green-400">
              <TrendingUp size={18} /> Plan Analysis
            </h2>
            <div className="space-y-4 my-2">
              <div className="bg-slate-800/40 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase">Monthly Needed</p>
                <p className="text-2xl font-black">{monthlyRequired.toFixed(1)} <span className="text-xs text-slate-400">ADA</span></p>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase">Days Left</p>
                <p className="text-2xl font-black text-orange-500">{daysLeft} <span className="text-xs">DAYS</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Progress Tracker</p>
              <h3 className="text-3xl font-black">{currentSaved} <span className="text-xs font-normal text-slate-500">of {target} ADA</span></h3>
            </div>
            <span className="text-2xl font-black text-orange-500">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-6 rounded-full overflow-hidden p-1 shadow-inner">
            <div className="bg-gradient-to-r from-orange-600 to-amber-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                 style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={handleDeposit} disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-500 active:scale-95 text-white py-6 rounded-2xl font-black text-xl transition-all shadow-xl uppercase">
            {loading ? 'Processing...' : `Save ${monthlyRequired.toFixed(1)} ADA Now`}
          </button>
          
          <button disabled={currentSaved < target}
                  className={`w-full py-6 rounded-2xl font-black text-xl transition-all uppercase border-2 ${
                    currentSaved >= target ? 'bg-green-600 text-white border-green-400' : 'bg-transparent text-slate-800 border-slate-900 cursor-not-allowed'
                  }`}>
            {currentSaved >= target ? '🎉 Target Met: Withdraw' : '🔒 Goal Locked'}
          </button>
        </div>

        {status && (
          <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl text-center font-mono text-xs text-orange-200">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}