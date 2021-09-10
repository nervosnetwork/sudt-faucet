import { Tooltip, Typography } from 'antd';
import React from 'react';

function truncateMiddle(str: string, start: number, end = start): string {
  if (!start || !end || start <= 0 || end <= 0) throw new Error('start or end is invalid');
  if (str.length <= start + end) return str;
  return str.slice(0, start) + '...' + str.slice(-end);
}

export const Address: React.FC<{ address: string }> = ({ address }) => {
  return (
    <Tooltip
      title={
        <Typography.Text copyable>
          {<Typography.Text style={{ color: 'white' }}>{address}</Typography.Text>}
        </Typography.Text>
      }
    >
      <span>{truncateMiddle(address, 8, 8)}</span>
    </Tooltip>
  );
};
