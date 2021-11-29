import React, { useEffect, useState } from 'react';

import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

import { Tools } from './Tools';
import './Main.css';

export const Main = () => {
  const walletContext = useWallet();
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('tools');

  useEffect(() => {
    const getBalance = async () => {
      if (!walletContext.publicKey) return;
      const result = await connection.getBalance(walletContext.publicKey);
      setSolBalance(result);
    };

    void getBalance();
  }, [connection, walletContext.publicKey]);

  const isConnected = walletContext.connected;

  const renderTabPanel = () => {
    switch (activeTab) {
      case 'tools':
        return (
          <div className="tab-panel">
            <Tools />
          </div>
        );
      case 'apps':
      default:
        return <div className="tab-panel">apps</div>;
    }
  };

  return (
    <div className="container">
      <div
        className="header"
        style={{
          justifyContent: isConnected ? 'space-between' : 'center',
        }}
      >
        <WalletMultiButton />
        {isConnected && <WalletDisconnectButton />}
      </div>
      {isConnected && solBalance ? (
        <>
          <div className="balance">
            <div>Balance</div>
            <div>
              <img
                className="token-logo"
                alt=""
                src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
              />
              {`${solBalance / Math.pow(10, 9)} SOL`}
            </div>
          </div>
          <div className="apps-conatiner">
            <div className="tabs">
              {['apps', 'tools'].map((t) => (
                <div
                  className={`tab ${t === activeTab ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </div>
              ))}
            </div>
            {renderTabPanel()}
          </div>
        </>
      ) : undefined}
    </div>
  );
};
