import { CategoryType } from '@/types/category';
import { GoalType } from '@/types/goal';
import { TransitionEnum } from '@/types/transition';

export type TransitionFormProps = {
  createTransition: TransitionFormType;
};

export type CategoryFormProps = {
  createCategory: { id: string };
};

export type TransitionFormType = {
  id: string;
  amount: number;
  date: Date;
  type: TransitionEnum;
  category: CategoryType;
  note?: string;
  goal?: GoalType;
};
