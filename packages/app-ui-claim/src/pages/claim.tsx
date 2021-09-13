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
  flex-direction: column;
  padding: 20px;
  .content {
  }

  .content-text {
    width: 500px;
    padding: 20px;
    line-height: 20px;
    margin-top: 30px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    .title {
      font-size: 24px;
      padding-bottom: 10px;
    }
  }

  .steps {
    width: 500px;
  }
`;
const Claim: React.FC<{ address: string; claimSecret: string }> = ({ address, claimSecret }) => {
  const config = useGlobalConfig();
  const { client } = ClaimContainer.useContainer();
  const query = useClaimStatus();
  const claimData = query.data;
  let current = 0;
  if (claimData?.claimStatus.status === 'claimed' || claimData?.claimStatus.status === 'claiming') {
    current = 1;
  }
  if (!query.isFetched) return null;

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
  const getStep0Render = () => {
    return (
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
    );
  };

  const getStep1Render = () => {
    return (
      <div className="content-text">
        <div className="title">Your tokens have been claimed</div>
        <div className="description">
          <span>click to </span>
          <a
            target="_blank"
            href={`https://explorer.nervos.org/aggron/transaction/${query.data?.claimStatus.txHash}`}
            rel="noreferrer"
          >
            Transaction Detail
          </a>
        </div>
      </div>
    );
  };

  if (query.data) {
    return (
      <Wrapper>
        <Steps current={current} className="steps">
          <Steps.Step title="Claim request sent" />
          <Steps.Step title="Finished" />
        </Steps>
        {current === 0 ? getStep0Render() : getStep1Render()}
      </Wrapper>
    );
  }
  return <div> not found </div>;
};
export default Claim;
