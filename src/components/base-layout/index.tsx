/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useLazyQuery } from '@apollo/client';
import { Button, Layout, Menu, notification } from 'antd';

import { GET_USER_BY_ID } from '@/lib/graphQL/users';
import { NotificationType, useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';

import { HeaderApp } from '../header-app';
import { MENU_ITEMS } from './constants';

import styles from './styles.module.css';

const { Sider, Content } = Layout;

export const LayoutApp = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const { notification: notificationData, removeNotification } = useNotificationStore();
  const location = useLocation();

  const [fetchUserById] = useLazyQuery<any>(GET_USER_BY_ID);

  const selectedKey = location.pathname.split('/')[1] || 'home';

  useEffect(() => {
    const id = sessionStorage.getItem('userId');

    const getUserById = async (id: string) => {
      if (!id) return;

      try {
        useUserStore.setState({ loading: true, error: null });

        const { data } = await fetchUserById({ variables: { id } });

        if (data?.authUser) {
          useUserStore.setState({ user: data.authUser, loading: false });
        } else {
          useUserStore.setState({ user: null, loading: false });
        }
      } catch (e) {
        console.error(e);
        useUserStore.setState({
          user: null,
          error: Error('Ошибка загрузки пользователя'),
          loading: false,
        });
      }
    };

    if (id) {
      getUserById(id);
    }
  }, [fetchUserById]);

  useEffect(() => {
    if (notificationData?.type) {
      viewNotification(notificationData);
      removeNotification();
    }
  }, [notificationData]);

  const viewNotification = (data: NotificationType | null) => {
    if (!data) return;

    const { type, message, description } = data;

    if (type === 'error') {
      api.error({
        message,
        description,
      });
    } else if (type === 'success') {
      api.success({
        message,
        description,
      });
    }
  };

  return (
    <Layout>
      {contextHolder}
      <Sider trigger={null} collapsible collapsed={collapsed} className={styles.siderWrapper}>
        <div className="demo-logo-vertical">
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined className={styles.iconWrapper} />
              ) : (
                <MenuFoldOutlined className={styles.iconWrapper} />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={MENU_ITEMS}
          className={styles.menuWrapper}
        />
      </Sider>
      <Layout>
        <HeaderApp />
        <Content className={styles.contentWrapper}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
