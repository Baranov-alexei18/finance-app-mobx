import { NavLink } from 'react-router';
import { Typography } from 'antd';

import { ROUTE_PATHS } from '@/constants/route-path';

import styles from './styles.module.css';

import NotFoundImage from '/not-found.png';

export const NotFoundPage = () => {
  const userId = sessionStorage.getItem('userId');

  return (
    <div className={styles.wrapper}>
      <div className={styles.blockWrapper}>
        <img src={NotFoundImage} alt="Not found" width={300} height={300} />
        <Typography.Title level={2}>Страница не найдена</Typography.Title>
        <NavLink to={userId ? ROUTE_PATHS.home : ROUTE_PATHS.auth} className={styles.link}>
          {userId ? 'Вернуться на главную' : 'Страница авторизации'}
        </NavLink>
      </div>
    </div>
  );
};
