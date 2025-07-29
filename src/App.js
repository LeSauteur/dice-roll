import React, { useState, useEffect } from 'react';
import { useWeb3 } from './context/Web3Context';

export default function App() {
  // Используем контекст Web3
  const { 
    connectWallet, 
    switchToSepolia,
    getTestTokens,
    account, 
    active, 
    chainId,
    tokenBalance,
    isMinting,
    networkError
  } = useWeb3();
  
  // Game state
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [gameHistory, setGameHistory] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);
  const [guess, setGuess] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Проектные данные
  const projectName = "DiceRoll Finance";
  const tokenSymbol = "DICE";
  const tokenName = "DiceRoll Token";

  // Синхронизируем локальный баланс с балансом токена
  useEffect(() => {
    if (tokenBalance) {
      const numericBalance = parseFloat(tokenBalance);
      setBalance(isNaN(numericBalance) ? 0 : Math.floor(numericBalance * 100) / 100);
    }
  }, [tokenBalance]);

  // Синхронизируем подключение кошелька
  useEffect(() => {
    setConnected(active && account);
  }, [active, account]);

  // Форматирование чисел
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Функция для начала новой игры
  const startNewGame = async () => {
    if (!connected) {
      alert("Пожалуйста, подключите свой кошелек сначала");
      return;
    }
    
    if (betAmount > balance) {
      alert("Недостаточно токенов для ставки");
      return;
    }
    
    setIsPlaying(true);
    setPreviousNumber(currentNumber || Math.floor(Math.random() * 100) + 1);
    setLastResult(null);
    setGuess(null);
    
    // Обновляем баланс (симуляция)
    setBalance(prev => prev - betAmount);
  };

  // Функция для угадывания
  const makeGuess = async (direction) => {
    if (!isPlaying) return;
    setGuess(direction);
    
    // Симулируем серверный ответ
    setTimeout(() => {
      const newNumber = Math.floor(Math.random() * 100) + 1;
      setCurrentNumber(newNumber);
      let result = null;
      
      if ((direction === 'higher' && newNumber > previousNumber) || 
          (direction === 'lower' && newNumber < previousNumber)) {
        // Пользователь выиграл
        setBalance(prev => prev + Math.floor(betAmount * 0.95));
        result = 'win';
      } else if (newNumber === previousNumber) {
        // Ничья
        result = 'tie';
      } else {
        // Пользователь проиграл
        result = 'lose';
      }
      
      setLastResult(result);
      setIsPlaying(false);
      
      // Добавляем в историю игр
      setGameHistory(prev => [
        ...prev.slice(-9),
        {
          id: Date.now(),
          previous: previousNumber,
          current: newNumber,
          guess: direction,
          result,
          bet: betAmount
        }
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="url(#diceGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 17L12 22L21 7" stroke="url(#diceGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="diceGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7F00FF" />
                  <stop offset="1" stopColor="#007BFF" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">{projectName}</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#game" className="hover:text-purple-400 transition-colors">Game</a>
            <a href="#tokenomics" className="hover:text-purple-400 transition-colors">Tokenomics</a>
            <a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a>
            <a href="#about" className="hover:text-purple-400 transition-colors">About</a>
            <a href="#roadmap" className="hover:text-purple-400 transition-colors">Roadmap</a>
          </nav>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col space-y-2">
              {networkError && (
                <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 px-4 py-2 rounded-lg mb-2">
                  {networkError}
                  <button 
                    onClick={switchToSepolia}
                    className="ml-2 underline hover:text-yellow-300"
                  >
                    Переключиться на Sepolia
                  </button>
                </div>
              )}
              
              {!connected ? (
                <button 
                  onClick={connectWallet} 
                  className="px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400"
                >
                  Connect MetaMask
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={getTestTokens}
                    disabled={isMinting}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isMinting 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isMinting ? 'Getting Tokens...' : 'Get Test Tokens'}
                  </button>
                  <div className="px-4 py-2 rounded-lg bg-green-600">
                    {account && `${account.slice(0, 6)}...${account.slice(-4)}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Play to Earn with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">{tokenName}</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                A revolutionary crypto project where you can trade tokens or test your luck in our provably fair "Higher or Lower" game. Win to earn, lose and watch them burn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#game" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg font-medium text-center hover:opacity-90 transition-opacity">
                  Play Now
                </a>
                <a href="#how-it-works" className="px-8 py-3 bg-gray-800 rounded-lg font-medium text-center hover:bg-gray-700 transition-colors">
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-2xl transform rotate-6 scale-105"></div>
              <div className="relative bg-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Your Balance</p>
                    <p className="text-2xl font-bold">{formatNumber(balance)} {tokenSymbol}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    balance >= 1000 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {balance >= 1000 ? 'Healthy' : 'Low Balance'}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max={balance}
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.min(parseInt(e.target.value) || 0, balance))}
                      className="w-full bg-gray-700 rounded-l-lg px-4 py-2 focus:outline-none"
                    />
                    <button 
                      onClick={() => setBetAmount(Math.floor(balance / 2))}
                      className="bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600 transition-colors"
                    >
                      Half
                    </button>
                    <button 
                      onClick={() => setBetAmount(balance)}
                      className="bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600 transition-colors rounded-r-lg"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={startNewGame}
                    disabled={isPlaying}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      isPlaying 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400'
                    }`}
                  >
                    {isPlaying ? 'Game In Progress...' : 'Start New Game'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Game Section */}
      <section id="game" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Play the Game</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Test your luck and see if you can predict the next number. Will you go higher or lower?
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-800/50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Game Status</h3>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {connected ? 'Wallet Connected' : 'Connect Your Wallet'}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Balance</label>
                        <p className="text-2xl font-bold">{formatNumber(balance)} {tokenSymbol}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Current Bet</label>
                        <p className="text-2xl font-bold">{formatNumber(betAmount)} {tokenSymbol}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Game Controls</h3>
                    <div className="mb-6">
                      <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="1"
                          max={balance}
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.min(parseInt(e.target.value) || 0, balance))}
                          className="w-full bg-gray-700 rounded-l-lg px-4 py-2 focus:outline-none"
                        />
                        <button 
                          onClick={() => setBetAmount(Math.floor(balance / 2))}
                          className="bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600 transition-colors"
                        >
                          Half
                        </button>
                        <button 
                          onClick={() => setBetAmount(balance)}
                          className="bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600 transition-colors rounded-r-lg"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={startNewGame}
                        disabled={isPlaying}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          isPlaying 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400'
                        }`}
                      >
                        {isPlaying ? 'Game In Progress...' : 'Start New Game'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-6">Game Board</h3>
                  <div className="aspect-square bg-gray-900 rounded-lg border border-gray-700 p-6 flex flex-col items-center justify-center">
                    {isPlaying ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-pulse mb-6">
                          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-purple-500/20">
                            {previousNumber}
                          </div>
                        </div>
                        <p className="text-center text-gray-300 mb-8">Will the next number be higher or lower?</p>
                        <div className="grid grid-cols-2 gap-4 w-full">
                          <button 
                            onClick={() => makeGuess('higher')}
                            className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 font-medium transition-colors"
                          >
                            Higher
                          </button>
                          <button 
                            onClick={() => makeGuess('lower')}
                            className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 font-medium transition-colors"
                          >
                            Lower
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {lastResult === 'win' && (
                          <div className="mb-6 animate-bounce">
                            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                            </svg>
                          </div>
                        )}
                        {lastResult === 'lose' && (
                          <div className="mb-6 animate-bounce">
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                        )}
                        {lastResult === 'tie' && (
                          <div className="mb-6 animate-pulse">
                            <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
                            </svg>
                          </div>
                        )}
                        <div className="text-center mb-6">
                          {lastResult === 'win' && "You won! Your bet has been doubled!"}
                          {lastResult === 'lose' && "You lost! Your bet has been burned."}
                          {lastResult === 'tie' && "It's a tie! No tokens were burned or gained."}
                        </div>
                        <p className="text-gray-400 text-center mb-8">
                          {lastResult ? "Start a new game or adjust your bet amount" : "Click 'Start New Game' to begin"}
                        </p>
                        <button 
                          onClick={startNewGame}
                          disabled={isPlaying}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                            isPlaying 
                              ? 'bg-gray-600 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400'
                          }`}
                        >
                          Start New Game
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 p-6">
              <h3 className="text-lg font-semibold mb-4">Game History</h3>
              {gameHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No games played yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400">
                        <th className="pb-3">Game</th>
                        <th className="pb-3">Guess</th>
                        <th className="pb-3">Result</th>
                        <th className="pb-3">Bet</th>
                        <th className="pb-3">Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameHistory.map((game, index) => (
                        <tr key={game.id} className="border-t border-gray-700">
                          <td className="py-3">{index + 1}</td>
                          <td className="py-3 capitalize">{game.guess}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              game.result === 'win' ? 'bg-green-500/20 text-green-400' : 
                              game.result === 'lose' ? 'bg-red-500/20 text-red-400' : 
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {game.result}
                            </span>
                          </td>
                          <td className="py-3">{game.bet} {tokenSymbol}</td>
                          <td className="py-3">
                            {game.result === 'win' && <span className="text-green-400">+{game.bet}</span>}
                            {game.result === 'lose' && <span className="text-red-400">-{game.bet}</span>}
                            {game.result === 'tie' && <span className="text-gray-400">0</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Tokenomics Section */}
      <section id="tokenomics" className="py-20 px-4 bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tokenomics</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {tokenName} ({tokenSymbol}) operates on a unique economic model where tokens are either earned through successful gameplay or permanently burned.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-6">Token Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Name:</span>
                  <span>{tokenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Symbol:</span>
                  <span>{tokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Supply:</span>
                  <span>1,000,000,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Initial Distribution:</span>
                  <span>60% Public Sale, 20% Reserves, 10% Marketing, 10% Team</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Type:</span>
                  <span>ERC-20 (Ethereum)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Blockchain:</span>
                  <span>Ethereum & BSC</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-6">Burn Mechanics</h3>
              <div className="space-y-4">
                <p className="text-gray-300">
                  When players lose a game, 85% of their bet amount is permanently burned from circulation, reducing the total supply.
                </p>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Total Burned:</span>
                    <span>23,450,000 {tokenSymbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Supply:</span>
                    <span>976,550,000 {tokenSymbol}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Burn Rate:</h4>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full" style={{width: "2.345%"}}></div>
                    </div>
                    <span className="text-sm text-gray-400">2.345%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 bg-gray-900/50 p-8 rounded-xl border border-gray-800">
            <h3 className="text-2xl font-bold mb-6">Token Utility</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 className="font-medium mb-2">Gameplay</h4>
                <p className="text-gray-400">Use {tokenSymbol} to play the "Higher or Lower" game and potentially double your tokens.</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 className="font-medium mb-2">Trading</h4>
                <p className="text-gray-400">Trade {tokenSymbol} on decentralized exchanges like Uniswap or centralized exchanges.</p>
              </div>
              <div className="bg-gray-800/50 p-6 rounded-lg">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h4 className="font-medium mb-2">Security</h4>
                <p className="text-gray-400">The token contract is audited and includes anti-whale measures to protect smaller investors.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About DiceRoll Finance</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A revolutionary crypto project combining the excitement of gaming with the innovation of blockchain technology.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-300 mb-4">
                  At DiceRoll Finance, we're building a new kind of crypto economy where players can truly participate in the value creation process.
                </p>
                <p className="text-gray-300 mb-4">
                  Our platform combines the thrill of gaming with the power of blockchain technology to create a unique ecosystem where every action has real economic impact.
                </p>
                <p className="text-gray-300">
                  We believe that the future of crypto lies in creating engaging experiences that offer real utility and value to users.
                </p>
              </div>
            </div>
            <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Technology</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Blockchain</h4>
                  <p className="text-gray-400">
                    Built on Ethereum with support for other EVM-compatible chains. Our smart contracts are fully audited and transparent.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Randomness Verification</h4>
                  <p className="text-gray-400">
                    We use Chainlink VRF to ensure fair gameplay that can be independently verified.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Security</h4>
                  <p className="text-gray-400">
                    Our platform is protected by multiple security layers including smart contract audits, encryption, and multi-sig wallets for team funds.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Scalability</h4>
                  <p className="text-gray-400">
                    We're implementing Layer 2 solutions to ensure fast and affordable transactions for all users.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6 text-center">Our Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h4 className="font-bold mb-2">Transparency</h4>
                <p className="text-gray-400">All game outcomes and token burns are recorded on the blockchain for public verification.</p>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h4 className="font-bold mb-2">Innovation</h4>
                <p className="text-gray-400">We're pioneering new ways to combine gaming and DeFi to create engaging, value-driven experiences.</p>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h4 className="font-bold mb-2">Community</h4>
                <p className="text-gray-400">Our community drives development through governance proposals and active participation in the platform's growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Roadmap</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our journey to build a revolutionary crypto gaming platform.
            </p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-800 transform -translate-x-1/2 hidden md:block"></div>
            {/* Phase 1 */}
            <div className="mb-16 flex flex-col md:flex-row items-center">
              <div className="md:w-5/12 mb-4 md:mb-0 md:pr-8 text-right">
                <h3 className="text-2xl font-bold mb-2">Phase 1</h3>
                <p className="text-gray-400">Q4 2025</p>
              </div>
              <div className="md:w-2/12 flex justify-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full z-10"></div>
              </div>
              <div className="md:w-5/12 md:pl-8">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="text-xl font-bold mb-3">Foundations</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Launch of DICE token on Ethereum</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Development of core game logic and smart contracts</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Website launch with basic game interface</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Private sale and liquidity pool creation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Phase 2 */}
            <div className="mb-16 flex flex-col md:flex-row-reverse items-center">
              <div className="md:w-5/12 mb-4 md:mb-0 md:pl-8 text-left">
                <h3 className="text-2xl font-bold mb-2">Phase 2</h3>
                <p className="text-gray-400">Q2 2026</p>
              </div>
              <div className="md:w-2/12 flex justify-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full z-10"></div>
              </div>
              <div className="md:w-5/12 md:pr-8">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="text-xl font-bold mb-3">Expansion</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Mobile app development for iOS and Android</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Integration with major crypto wallets</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Launch of referral program with rewards</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Community tournaments with DICE prizes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Phase 3 */}
            <div className="mb-16 flex flex-col md:flex-row items-center">
              <div className="md:w-5/12 mb-4 md:mb-0 md:pr-8 text-right">
                <h3 className="text-2xl font-bold mb-2">Phase 3</h3>
                <p className="text-gray-400">Q3 2026</p>
              </div>
              <div className="md:w-2/12 flex justify-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full z-10"></div>
              </div>
              <div className="md:w-5/12 md:pl-8">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="text-xl font-bold mb-3">Growth</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Launch of additional games (Dice Duels - PvP mode)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Partnerships with crypto casinos and gaming platforms</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Layer 2 scaling solution implementation</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>NFT-based achievements and status system</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Phase 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center">
              <div className="md:w-5/12 mb-4 md:mb-0 md:pl-8 text-left">
                <h3 className="text-2xl font-bold mb-2">Phase 4</h3>
                <p className="text-gray-400">Q1 2027+</p>
              </div>
              <div className="md:w-2/12 flex justify-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full z-10"></div>
              </div>
              <div className="md:w-5/12 md:pr-8">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h4 className="text-xl font-bold mb-3">Maturity</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Decentralized governance via token voting</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Launch on multiple blockchains (Ethereum, BSC, Polygon)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Integration with DeFi protocols for staking and yield farming</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Global expansion with localized versions of the platform</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="url(#diceFooterGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 17L12 22L21 7L12 12L3 17Z" stroke="url(#diceFooterGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="diceFooterGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#7F00FF" />
                      <stop offset="1" stopColor="#007BFF" />
                    </linearGradient>
                  </defs>
                </svg>
                <h2 className="text-lg font-bold">{projectName}</h2>
              </div>
              <p className="text-gray-400">
                A revolutionary crypto project combining the excitement of gaming with the innovation of blockchain technology.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#game" className="hover:text-white transition-colors">Play Now</a></li>
                <li><a href="#tokenomics" className="hover:text-white transition-colors">Tokenomics</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Whitepaper</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Smart Contract</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Verification Code</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Audit Report</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Social Media</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medium</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} {projectName}. All rights reserved.</p>
            <p className="mt-2 text-sm">This is a demo website for a crypto project. Not a financial recommendation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}