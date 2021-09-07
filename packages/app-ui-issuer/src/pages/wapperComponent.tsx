import React, { ReactNode } from 'react';
import Header from '../components/header';

interface IProps {
  children?: ReactNode;
  title?: string;
}
export const WapperComponent: ({ children, title }: IProps) => JSX.Element = ({ children, title }: IProps) => {
  return (
    <>
      <Header title={title}></Header>
      {children}
    </>
  );
};
