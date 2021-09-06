import React from 'react';
import styled from 'styled-components';
interface IProps {
  title?: string;
}
const HeaderWrapper = styled.div`
  .header {
    height: 40px;
    line-height: 40px;
    text-align: center;
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
`;
const Header: React.FC<IProps> = (props: IProps) => {
  return (
    <HeaderWrapper>
      <div className="header">{props.title}</div>
    </HeaderWrapper>
  );
};

export default Header;
