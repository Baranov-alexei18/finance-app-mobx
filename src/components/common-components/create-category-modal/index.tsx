import { useState } from 'react';
import { CheckOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Button, ColorPicker, Input, List, Modal, Popconfirm, Tooltip } from 'antd';

import { DELETE_CATEGORY, EDIT_CATEGORY, REGISTER_CREATE_CATEGORY } from '@/lib/graphQL/category';
import { useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';
import { TransitionEnum } from '@/types/transition';
import { getCapitalizeFirstLetter } from '@/utils/get-capitalize-first-letter';

import styles from './styles.module.css';

type Props = {
  type: TransitionEnum;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onAddCategory: (name: string, color: string) => void;
};

type EditCategoryProps = {
  updateCategory: { id: string };
};

type DeleteCategoryProps = {
  deleteCategory: { id: string };
};

const BLACK_COLOR = '#000000';

export const CreateCategoryModal = ({ type, loading, isOpen, onClose, onAddCategory }: Props) => {
  const { getCategoriesByType, updateCategoryById, deleteCategoryById } = useUserStore();
  const { setNotification } = useNotificationStore();

  const [editCategory] = useMutation<EditCategoryProps>(EDIT_CATEGORY);
  const [deleteCategory] = useMutation<DeleteCategoryProps>(DELETE_CATEGORY);
  const [publishCategory] = useMutation(REGISTER_CREATE_CATEGORY);

  const [newCategory, setNewCategory] = useState('');
  const [newColor, setNewColor] = useState(BLACK_COLOR);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const categories = getCategoriesByType(TransitionEnum[type]);

  const handleClose = () => {
    onClose();
    setNewCategory('');
    setNewColor(BLACK_COLOR);
    setEditingId(null);
    setEditedName('');
  };

  const handleSaveCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim(), newColor);
      handleClose();
    }
  };

  const updateCategory = async (
    id: string,
    dataCategory: { name?: string; chartColor?: string }
  ) => {
    try {
      const { data } = await editCategory({
        variables: {
          id,
          data: dataCategory,
        },
      });

      if (!data?.updateCategory.id) {
        throw new Error('Не удалось изменить категорию');
      }

      const { data: categoryId } = await publishCategory({
        variables: { id: data.updateCategory.id },
      });

      if (!categoryId) {
        throw new Error('Не удалось сохранить изменения категории');
      }

      updateCategoryById(data.updateCategory.id, dataCategory);

      setNotification({
        type: 'success',
        message: 'Категория изменена',
        description: 'Категория успешно обновлена',
      });
    } catch (e) {
      setNotification({
        type: 'error',
        message: 'Ошибка',
        description: String(e),
      });
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await deleteCategory({
        variables: {
          id,
        },
      });

      deleteCategoryById(id);

      setNotification({
        type: 'success',
        message: 'Выполнено',
        description: 'Категория успешно удалена',
      });
    } catch (e) {
      setNotification({
        type: 'error',
        message: 'Ошибка',
        description: String(e),
      });
    }
  };

  const toggleEdit = (itemId: string, currentName: string) => {
    if (editingId === itemId) {
      if (editedName.trim() && editedName !== currentName) {
        updateCategory(itemId, { name: editedName.trim() });
      }
      setEditingId(null);
      setEditedName('');
    } else {
      setEditingId(itemId);
      setEditedName(currentName);
    }
  };

  return (
    <Modal
      title={`Новая категория ${type === TransitionEnum.EXPENSE ? 'расходов' : 'доходов'}`}
      open={isOpen}
      confirmLoading={loading}
      onOk={handleSaveCategory}
      onCancel={handleClose}
      okText="Добавить"
      cancelText="Отмена"
    >
      <List
        header="Существующие категории"
        dataSource={categories}
        locale={{ emptyText: 'Нет категорий' }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Tooltip title={editingId === item.id ? 'Сохранить' : 'Редактировать'} key="edit">
                <Button
                  icon={editingId === item.id ? <CheckOutlined /> : <EditOutlined />}
                  onClick={() => toggleEdit(item.id, item.name)}
                  size="small"
                />
              </Tooltip>,
              <Popconfirm
                key="delete"
                title="Удалить категорию?"
                onConfirm={() => removeCategory(item.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Tooltip title="Удалить">
                  <Button icon={<DeleteOutlined />} danger size="small" />
                </Tooltip>
              </Popconfirm>,
            ]}
          >
            <div className={styles.listItemWrapper}>
              <ColorPicker
                key="color"
                size="small"
                value={item.chartColor}
                className={styles.colorPicker}
                onChangeComplete={(color) => {
                  const colorValue = color.toHexString();
                  if (colorValue !== item.chartColor) {
                    updateCategory(item.id, { chartColor: colorValue });
                  }
                }}
              />
              {editingId === item.id ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  size="small"
                />
              ) : (
                <span>{getCapitalizeFirstLetter(item.name)}</span>
              )}
            </div>
          </List.Item>
        )}
      />
      <div className={styles.wrapper}>
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Введите название категории"
          maxLength={30}
        />
        <ColorPicker
          value={newColor}
          onChangeComplete={(color) => {
            setNewColor(color.toHexString());
          }}
        />
      </div>
    </Modal>
  );
};
