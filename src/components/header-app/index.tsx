import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  DownOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  MenuOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Drawer, Dropdown, Flex, Layout, MenuProps, Select, Space } from 'antd';
import { observer } from 'mobx-react-lite';

import { GRANULARITY } from '@/constants/granularity';
import { ROUTE_PATHS } from '@/constants/route-path';
import { granularityStore } from '@/store/granularityStore';
import { userStore } from '@/store/userStore';
import { calculateBalance } from '@/utils/calculate-balance';

import { MENU_ITEMS } from '../base-layout/constants';

import styles from './styles.module.css';

const { Header } = Layout;

export const HeaderApp = observer(() => {
  const navigate = useNavigate();
  const { user } = userStore;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(
    sessionStorage.getItem('isBalanceVisible') === 'true'
  );
  const balance = calculateBalance(user?.transitions || []);

  const toggleBalanceVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    sessionStorage.setItem('isBalanceVisible', (!balanceVisible).toString());

    setBalanceVisible((prev) => !prev);
  };

  const handleExit = () => {
    navigate(ROUTE_PATHS.auth);
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('isBalanceVisible');
  };

  const handleChange = (value: keyof typeof GRANULARITY) => {
    if (!value) return;
    granularityStore.setGranularityType(value);
  };

  const menuItems: MenuProps['items'] = [
    {
      label: (
        <Flex align="center" justify="space-between" style={{ width: '100%' }}>
          <span className={styles.balanceText}>
            {balanceVisible ? `${balance} y.e.` : '**** y.e.'}
          </span>
          <div onClick={(e) => toggleBalanceVisibility(e)} style={{ cursor: 'pointer' }}>
            {balanceVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </div>
        </Flex>
      ),
      key: '1',
    },
    {
      label: <NavLink to={ROUTE_PATHS.edit}>Редактировать</NavLink>,
      key: '2',
    },
    {
      type: 'divider',
    },
    {
      label: (
        <Button danger onClick={handleExit} style={{ width: '100%' }}>
          Выйти
        </Button>
      ),
      key: '3',
    },
  ];

  const periodItems = Object.entries(GRANULARITY).map(([key, label]) => ({
    value: key,
    label,
  }));

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  return (
    <Header className={styles.headerWrapper}>
      <Button
        className={styles.burgerButton}
        type="text"
        icon={<MenuOutlined />}
        onClick={toggleDrawer}
      />

      <Select
        className={styles.selectWrapper}
        size="large"
        defaultValue={granularityStore.type}
        onChange={handleChange}
        options={periodItems}
      />

      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <a onClick={(e) => e.preventDefault()}>
          <Space wrap align="center">
            <Avatar
              size={40}
              icon={
                user?.avatar?.url ? <img src={user.avatar.url} alt="Avatar" /> : <UserOutlined />
              }
            />
            {user?.name || 'Name'}
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>

      <Drawer title="Меню" placement="top" onClose={toggleDrawer} open={drawerOpen}>
        <nav className={styles.mobileMenu}>{MENU_ITEMS.map((item) => item.label)}</nav>
      </Drawer>
    </Header>
  );
});
