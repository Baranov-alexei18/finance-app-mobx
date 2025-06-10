import { NavLink } from 'react-router';
import {
  MinusCircleOutlined,
  PlusCircleOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

import { ROUTE_PATHS } from '../../constants/route-path';

export const MENU_ITEMS = [
  {
    key: 'home',
    icon: <UserOutlined />,
    label: (
      <NavLink to={ROUTE_PATHS.home} end>
        Главная
      </NavLink>
    ),
  },
  {
    key: 'income',
    icon: <PlusCircleOutlined />,
    label: (
      <NavLink to={ROUTE_PATHS.income} end>
        Доходы
      </NavLink>
    ),
  },
  {
    key: 'expense',
    icon: <MinusCircleOutlined />,
    label: (
      <NavLink to={ROUTE_PATHS.expense} end>
        Расходы
      </NavLink>
    ),
  },
  {
    key: 'goals',
    icon: <VideoCameraOutlined />,
    label: (
      <NavLink to={ROUTE_PATHS.goals} end>
        Цели
      </NavLink>
    ),
  },
];
