import { makeAutoObservable } from 'mobx';

export type NotificationType = {
  type: string;
  message: string;
  description: string;
};

interface Store {
  notification: NotificationType | null;
  setNotification: (data: NotificationType) => void;
  removeNotification: () => void;
}

class NotificationStore implements Store {
  notification: Store['notification'] = null;

  constructor() {
    makeAutoObservable(this);
  }

  setNotification(data: NotificationType) {
    this.notification = data;
  }

  removeNotification() {
    this.notification = null;
  }
}

export const notificationStore = new NotificationStore();
