import { Tabs } from 'antd';
import React from 'react';
import styled from 'styled-components';
import IssueTokenAddress from '../components/issueTokenAddress';
import IssueTokenMail from '../components/issueTokenMail';
import IssueTokenMailBatch from '../components/issueTokenMailBatch';

const StyleWrapper = styled.div`
  padding: 20px;
  .actions {
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
    button + button {
      margin-top: 10px;
    }
  }
`;

const IssueToken: React.FC = () => {
  return (
    <StyleWrapper>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Address" key="1">
          <IssueTokenAddress />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Mail" key="2">
          <IssueTokenMail />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Mail(batch)" key="3">
          <IssueTokenMailBatch />
        </Tabs.TabPane>
      </Tabs>
    </StyleWrapper>
  );
};
export default IssueToken;
