import { Button, Modal, Result, Steps, Typography, Spin } from 'antd';
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';
import { ClaimContainer } from '../ClaimContainer';
import { useClaimStatus } from '../hooks/useClaimStatus';
import { useGlobalConfig } from '../hooks/useGlobalConfig';
import { Address } from './address';
const Wrapper = styled.div`
  height: calc(90% - 40px);
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 60px 20px;
  margin: auto;

  .content-text {
    padding: 20px;
    line-height: 20px;
    margin-top: 30px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    .title {
      font-size: 24px;
      text-align: center;
      padding-bottom: 10px;
      line-height: 1.4;
    }
  }
  .result-container {
    width: 100%;
  }
  .claim-button {
    width: 120px;
  }
`;
const Claim: React.FC<{ address: string; claimSecret: string }> = ({ address, claimSecret }) => {
  const config = useGlobalConfig();
  const { client } = ClaimContainer.useContainer();
  const query = useClaimStatus();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  if (!query.isFetched) return null;
  if (!query.data) return null;

  const claimData = query.data;
  let current = 0;

  if (claimData?.claimStatus.status === 'claimed') {
    current = 1;
  }

  async function claim() {
    setLoading(true);
    void queryClient.invalidateQueries('get_claim_history');
    return client.claim_sudt({ claimSecret, address }).then(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      (e: Error) => {
        Modal.error({
          title: 'Failed',
          content: <p>{e.message}</p>,
        });
      },
    );
  }
  const getUnclaimedRender = () => {
    if (query.data?.claimStatus.status !== 'claimed' && loading) {
      return (
        <>
          <Spin></Spin>
          <Typography.Text>It will take faw moment to claim</Typography.Text>
        </>
      );
    }
    return (
      <Result
        title={
          <div>
            Claim to <Address address={address} />
          </div>
        }
        className="result-container"
        status="info"
        subTitle={
          <Typography>
            <Typography.Text>
              A claim invitation can only be claimed once, are you sure you want to claim to this address?
            </Typography.Text>
            <Typography.Text>{address}</Typography.Text>
          </Typography>
        }
        extra={
          <Button size="large" type="primary" onClick={claim} className="claim-button">
            Claim
          </Button>
        }
      />
    );
  };

  const getClaimedRender = () => {
    if (claimData.claimStatus.status !== 'claimed') return;
    return (
      <div className="content-text">
        <div className="title">Successfully claimed</div>
        <div className="description">
          <span>click to my </span>
          <a target="_blank" href={`${config.walletUrl}`} rel="noreferrer">
            Wallet
          </a>
        </div>
        {claimData.claimStatus.txHash && (
          <div className="description">
            <span>click to my </span>
            <a target="_blank" href={`${config.nervosExplorerUrl}/${claimData.claimStatus.txHash}`} rel="noreferrer">
              Transaction Detail
            </a>
          </div>
        )}
      </div>
    );
  };

  const getDisabledRender = () => {
    return <div>disabled</div>;
  };
  if (claimData.claimStatus.status === 'disabled') {
    return (
      <Wrapper>
        <Typography.Text>This is a disabled token </Typography.Text>
      </Wrapper>
    );
  }

  if (query.data) {
    return (
      <Wrapper>
        <Steps current={current} className="steps">
          <Steps.Step title="Claim" />
          <Steps.Step title="Finished" />
        </Steps>
        {claimData.claimStatus.status === 'unclaimed' && getUnclaimedRender()}
        {claimData.claimStatus.status === 'claiming' && <Spin />}
        {claimData.claimStatus.status === 'claimed' && getClaimedRender()}
      </Wrapper>
    );
  }
  return <div> not found </div>;
};
export default Claim;
