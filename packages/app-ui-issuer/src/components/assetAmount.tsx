import { helpers } from '@ckitjs/ckit';
import React from 'react';

type AssetAmountProps = { amount: string; decimals: number; symbol: string };

export const AssetAmount: React.FC<AssetAmountProps> = ({ amount, decimals, symbol }) => {
  return (
    <span>
      {helpers.Amount.from(amount).humanize({ separator: true, decimals })} <small>{symbol}</small>
    </span>
  );
};

export const CkbAssetAmount: React.FC<{ amount: string }> = ({ amount }) => {
  return <AssetAmount amount={amount} decimals={8} symbol="CKB" />;
};
