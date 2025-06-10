import { ReactNode } from 'react';

import styles from './styles.module.css';

type Props = {
  children: ReactNode;
};

export const BaseCardLayout = ({ children }: Props) => {
  return <div className={styles.wrapper}>{children}</div>;
};
