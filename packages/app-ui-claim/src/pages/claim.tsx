import { Button, Modal, Result, Steps } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { ClaimContainer } from '../ClaimContainer';
import { useClaimStatus } from '../hooks/useClaimStatus';
import { useGlobalConfig } from '../hooks/useGlobalConfig';
import { Address } from './address';

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
  const config = useGlobalConfig();
  const { client } = ClaimContainer.useContainer();
  const query = useClaimStatus();

  if (!query.isFetched) return null;

  // TODO add transaction hash
  if (query.data) {
    return (
      <Steps>
        <Steps.Step title="Claim request sent" />
        <Steps.Step title="Finished" />
      </Steps>
    );
  }

  async function claim() {
    return client.claim_sudt({ claimSecret, address }).then(
      () => {
        Modal.success({
          title: 'Congratulation',
          content: <p>Successfully claimed, go to my wallet to see</p>,
          okText: 'To Wallet',
          onOk: () => {
            window.location.href = config.walletUrl;
          },
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
      <Result
        title={
          <div>
            Claim to <Address address={address} />
          </div>
        }
        status="info"
        subTitle={
          <div>
            A claim invitation can only be claimed once, are you sure you want to claim to this address?
            <br />
            {address}
          </div>
        }
        extra={
          <Button size="large" type="primary" onClick={claim}>
            Claim
          </Button>
        }
      />
    </Wrapper>
  );
};
export default Claim;
