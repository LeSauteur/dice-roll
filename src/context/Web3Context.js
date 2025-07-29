import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

// ID сети Sepolia
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0x7a69'; // Hex для Sepolia

export const injected = new InjectedConnector({ 
  supportedChainIds: [SEPOLIA_CHAIN_ID] // Sepolia
});

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const { activate, account, library, active, chainId } = useWeb3React();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokenContract, setTokenContract] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  // Адрес токена и его ABI
  const tokenAddress = "0xf6eef65b150661e649a31ba890d36ff6901c7ffd";
const tokenAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

  // ПРОБЛЕМА РЕШЕНА: вынесенная функция fetchBalance
  const fetchBalance = async () => {
    if (tokenContract && account) {
      try {
        const balance = await tokenContract.balanceOf(account);
        const formattedBalance = ethers.utils.formatUnits(balance, 18);
        console.log("Обновленный баланс:", formattedBalance);
        setTokenBalance(formattedBalance);
      } catch (error) {
        console.error("Ошибка получения баланса:", error);
      }
    }
  };

  // Проверка сети
  useEffect(() => {
    if (active && chainId && chainId !== SEPOLIA_CHAIN_ID) {
      setNetworkError(`Пожалуйста, переключитесь на сеть Sepolia (ID: ${SEPOLIA_CHAIN_ID})`);
    } else {
      setNetworkError(null);
    }
  }, [active, chainId]);

  // Подключение кошелька
  const connectWallet = async () => {
    try {
      console.log("Попытка подключения к MetaMask...");
      await activate(injected);
      console.log("Успешно подключено к MetaMask!");
    } catch (error) {
      console.error("Ошибка подключения кошелька:", error);
      alert(`Ошибка подключения: ${error.message}. Убедитесь, что MetaMask установлен и разблокирован.`);
    }
  };

  // Переключение на Sepolia
  const switchToSepolia = async () => {
    if (!window.ethereum) {
      alert("Установите MetaMask!");
      return;
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      setNetworkError(null);
    } catch (switchError) {
      // Если сеть не добавлена, попробуем добавить
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              // ИСПРАВЛЕНО: убрал лишние пробелы в URL
              rpcUrls: ['https://rpc.sepolia.org/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }],
          });
          setNetworkError(null);
        } catch (addError) {
          console.error('Ошибка добавления сети Sepolia:', addError);
          alert('Не удалось добавить сеть Sepolia. Проверьте настройки MetaMask.');
        }
      } else {
        console.error('Ошибка переключения сети:', switchError);
        alert('Не удалось переключиться на сеть Sepolia.');
      }
    }
  };

  // Получение тестовых токенов
  const getTestTokens = async () => {
    if (!tokenContract || !account) {
      console.error("Контракт токена или аккаунт не определены");
      return;
    }
    
    try {
      setIsMinting(true);
      const tx = await tokenContract.mint(
        account, 
        ethers.utils.parseUnits("1000", 18)
      );
      await tx.wait();
      console.log("Токены успешно получены!");
      
      // ✅ ТЕПЕРЬ РАБОТАЕТ: немедленное обновление баланса
      await fetchBalance();
    } catch (error) {
      console.error("Ошибка получения тестовых токенов:", error);
      alert("Ошибка получения токенов. Возможно, контракт не поддерживает mint или вы не в сети Sepolia.");
    } finally {
      setIsMinting(false);
    }
  };

  // Инициализация контракта
  useEffect(() => {
    if (active && library) {
      const contract = new ethers.Contract(
        tokenAddress,
        tokenAbi,
        library.getSigner()
      );
      setTokenContract(contract);
    }
  }, [active, library]);

  // Получение баланса
  useEffect(() => {
    fetchBalance();
    
    // Подписка на события для обновления баланса
    if (tokenContract && account) {
      const updateBalance = () => {
        console.log("Обнаружена транзакция, обновляем баланс...");
        fetchBalance();
      };
      
      tokenContract.on("Transfer", updateBalance);
      
      // Дополнительная проверка каждые 5 секунд
      const interval = setInterval(fetchBalance, 5000);
      
      return () => {
        tokenContract.off("Transfer", updateBalance);
        clearInterval(interval);
      };
    }
  }, [tokenContract, account]);

  return (
    <Web3Context.Provider value={{
      connectWallet,
      switchToSepolia,
      getTestTokens,
      account,
      active,
      chainId,
      tokenBalance,
      tokenContract,
      isMinting,
      networkError
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);