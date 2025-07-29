import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Web3Provider } from './context/Web3Context';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';

const getLibrary = (provider) => {
  return new ethers.providers.Web3Provider(provider);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <Web3Provider>
      <App />
    </Web3Provider>
  </Web3ReactProvider>
);