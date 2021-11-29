import React, { useState } from 'react';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

import './Tools.css';

const initialValues = {
  singleTxAddress: '',
  singleTxAmount: '0.01',
  multipleTxAddress1: '',
  multipleTxAmount1: '0.01',
  multipleTxAddress2: '',
  multipleTxAmount2: '0.01',
};

const DEFAULT_BUTTON_TEXT = 'Send SOL';
const SENDING_BUTTON_TEXT = 'Sending...';
const SUCCESS_BUTTON_TEXT = 'Success';

export const Tools = () => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [values, setValues] = useState(initialValues);
  const [isExecutingSingle, setIsExecutingSingle] = useState<boolean>(false);
  const [isExecutingMultiple, setIsExecutingMultiple] = useState<boolean>(false);
  const [singleTxButtonText, setSingleTxButtonText] = useState<string>(DEFAULT_BUTTON_TEXT);
  const [multipleTxButtonText, setMultipleTxButtonText] = useState<string>(DEFAULT_BUTTON_TEXT);
  const [signstures, setSignatures] = useState<Array<string>>([]);

  const handleInputChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSingleTxButtonClick = async () => {
    try {
      if (!publicKey || !signTransaction || !values.singleTxAddress) return;

      setIsExecutingSingle(true);
      setSingleTxButtonText(SENDING_BUTTON_TEXT);
      setSignatures([]);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: new PublicKey(values.singleTxAddress),
          lamports: LAMPORTS_PER_SOL / 100,
        }),
      );

      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);

      const signature = await connection.sendRawTransaction(signedTx.serialize());
      setSignatures([signature]);

      setSingleTxButtonText(SUCCESS_BUTTON_TEXT);

      setTimeout(() => {
        setSingleTxButtonText(DEFAULT_BUTTON_TEXT);
        setValues(initialValues);
      }, 1000);

      setTimeout(() => {
        setSignatures([]);
      }, 10000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingSingle(false);
    }
  };

  const handleMultipleTxButtonClick = async () => {
    try {
      if (
        !publicKey ||
        !signAllTransactions ||
        !values.multipleTxAddress1 ||
        !values.multipleTxAddress2
      )
        return;

      setIsExecutingMultiple(true);
      setMultipleTxButtonText(SENDING_BUTTON_TEXT);
      setSignatures([]);

      const transaction1 = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: new PublicKey(values.multipleTxAddress1),
          lamports: LAMPORTS_PER_SOL / 100,
        }),
      );

      const transaction2 = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: new PublicKey(values.multipleTxAddress2),
          lamports: LAMPORTS_PER_SOL / 100,
        }),
      );

      transaction1.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      transaction1.feePayer = publicKey;
      transaction2.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      transaction2.feePayer = publicKey;

      const signedTxs = await signAllTransactions([transaction1, transaction2]);

      const signatures: string[] = [];
      for (const tx of signedTxs) {
        const signature = await connection.sendRawTransaction(tx.serialize());
        signatures.push(signature);
      }

      setSignatures(signatures);
      setMultipleTxButtonText(SUCCESS_BUTTON_TEXT);

      setTimeout(() => {
        setMultipleTxButtonText(DEFAULT_BUTTON_TEXT);
        setValues(initialValues);
      }, 1000);

      setTimeout(() => {
        setSignatures([]);
      }, 10000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecutingMultiple(false);
    }
  };

  return (
    <div className="send-container">
      <div className="send-single">
        <div>One transaction</div>
        <input
          type="text"
          placeholder="SOL address"
          name="singleTxAddress"
          disabled={isExecutingSingle}
          value={values.singleTxAddress}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Amount"
          name="singleTxAmount"
          disabled={true}
          value={values.singleTxAmount}
          onChange={handleInputChange}
        />
        <button disabled={isExecutingSingle} onClick={handleSingleTxButtonClick}>
          {singleTxButtonText}
        </button>
      </div>
      <div className="send-multiple">
        <div>Multiple transactions</div>
        <input
          type="text"
          placeholder="SOL address #1"
          name="multipleTxAddress1"
          disabled={isExecutingMultiple}
          value={values.multipleTxAddress1}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Amount #1"
          name="multipleTxAmount1"
          disabled={true}
          value={values.multipleTxAmount1}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="SOL address #2"
          name="multipleTxAddress2"
          disabled={isExecutingMultiple}
          value={values.multipleTxAddress2}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Amount #2"
          name="multipleTxAmount2"
          disabled={true}
          value={values.multipleTxAmount2}
          onChange={handleInputChange}
        />
        <button disabled={isExecutingMultiple} onClick={handleMultipleTxButtonClick}>
          {multipleTxButtonText}
        </button>
      </div>
      {signstures.length > 0 && (
        <div className="signatures">
          <div>Signatures</div>
          {signstures.map((sign) => (
            <div key={sign} style={{ marginBottom: '5px' }}>
              {sign}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
