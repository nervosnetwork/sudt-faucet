import { LeftOutlined } from '@ant-design/icons';
import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

interface IProps {
  title?: string;
}
const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
`;
const Header: React.FC<IProps> = (props: IProps) => {
  const history = useHistory();
  const goBack = () => {
    history.go(-1);
  };
  return (
    <HeaderWrapper>
      <LeftOutlined onClick={goBack} />
      <div className="header">{props.title}</div>
      <div></div>
    </HeaderWrapper>
  );
};

export default Header;
