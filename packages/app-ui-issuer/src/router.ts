import { FC } from 'react';
import CreateToken from './createToken';
import IssueToken from './issueToken';
import Login from './login';
import TokenDetail from './tokenDetail';
import TokenList from './tokenList';
import TokenManagement from './tokenManagement';

type RouteConfig = {
  path: string;
  component: FC<unknown> | React.ComponentClass;
  title: string;
};

const routeList: Array<RouteConfig> = [
  {
    path: '/login',
    component: Login,
    title: 'Token Issue',
  },
  {
    path: '/token-list',
    component: TokenList,
    title: 'Token Issue',
  },
  {
    path: '/create-token',
    component: CreateToken,
    title: 'Create Token',
  },
  {
    path: '/token-detail',
    component: TokenDetail,
    title: 'Token Detail',
  },
  {
    path: '/issue-token',
    component: IssueToken,
    title: 'Token Issue',
  },
  {
    path: '/token-management',
    component: TokenManagement,
    title: 'Token Issue',
  },
];

export { routeList };
