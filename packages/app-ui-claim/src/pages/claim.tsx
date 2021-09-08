import { Button, Modal, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { ClaimContainer } from '../ClaimContainer';

const Wrapper = styled.div`
  height: calc(90% - 40px);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .content {
  }

  .content-text {
    padding: 20px;
    line-height: 20px;
    margin-bottom: 30px;
  }
`;
const Claim: React.FC<{ address: string; claimSecret: string }> = ({ address, claimSecret }) => {
  const { client } = ClaimContainer.useContainer();

  async function claim() {
    return client.claim_sudt({ claimSecret, address }).then(
      () => {
        Modal.success({
          title: 'Congratulation',
          content: <p>Successfully claimed, go to my wallet to see</p>,
        });
      },
      (e: Error) => {
        Modal.error({
          title: 'Failed',
          content: <p>{e.message}</p>,
        });
      },
    );
  }

  return (
    <Wrapper>
      <Typography className="content-text">
        A claim invitation can only be claimed once, are you sure you want to claim to this address?
        <br />
        <Typography.Text copyable>{address}</Typography.Text>
      </Typography>
      <Button onClick={claim}>Claim</Button>
    </Wrapper>
  );
};
export default Claim;
