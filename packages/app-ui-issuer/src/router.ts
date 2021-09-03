import { FC } from 'react';
import CreateToken from './pages/createToken';
import IssueToken from './pages/issueToken';
import Login from './pages/login';
import TokenDetail from './pages/tokenDetail';
import TokenList from './pages/tokenList';
import TokenManagement from './pages/tokenManagement';

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
