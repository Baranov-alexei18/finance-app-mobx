import { makeAutoObservable } from 'mobx';

import { CategoryType } from '@/types/category';
import { GoalType } from '@/types/goal';
import { TransitionEnum, TransitionType } from '@/types/transition';
import { UserType } from '@/types/user';

interface Props {
  user: UserType | null;
  loading: boolean;
  error: Error | null;
  setUser: (user: UserType | null) => void;
  getTransactionsByType: (type: TransitionEnum) => TransitionType[];
  getCategoriesByType: (type: TransitionEnum) => CategoryType[];
  addNewTransaction: (transaction: TransitionType) => void;
  updateTransactionById: (id: string, updatedFields: Partial<TransitionType>) => void;
  deleteTransactionById: (id: string) => void;
  addNewCategory: (category: CategoryType) => void;
  updateCategoryById: (id: string, updatedFields: Partial<CategoryType>) => void;
  deleteCategoryById: (id: string) => void;
  addNewGoal: (goal: GoalType) => void;
}

class UserStore implements Props {
  user: Props['user'] = null;
  loading = false;
  error: Props['error'] = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: UserType | null) {
    this.user = user;
  }

  setLoading(load: boolean) {
    this.loading = load;
  }

  setError(error: Error | null) {
    this.error = error;
  }
  // user transitions
  getTransactionsByType(type: TransitionEnum) {
    if (!this.user || !this.user?.transitions) {
      return [];
    }
    return this.user.transitions.filter((transaction: TransitionType) => transaction.type === type);
  }

  addNewTransaction(transition: TransitionType) {
    if (!this.user) {
      return;
    }

    this.user = {
      ...this.user,
      transitions: [...this.user.transitions, transition],
      goals: transition.goal
        ? this.user.goals.map((goal: GoalType) =>
            goal.id === transition.goal?.id
              ? { ...goal, transitions: [...(goal.transitions || []), transition] }
              : goal
          )
        : this.user.goals,
    };
  }

  updateTransactionById(id: string, updatedFields: Partial<TransitionType>) {
    if (!this.user) return;

    const updatedTransitions = this.user?.transitions.map((transition) =>
      transition.id === id ? { ...transition, ...updatedFields } : transition
    );

    const updatedGoals = updatedFields.goal
      ? this.user.goals.map((goal) =>
          goal.id === updatedFields.goal?.id
            ? {
                ...goal,
                transitions: goal.transitions?.map((t) =>
                  t.id === id ? { ...t, ...updatedFields } : t
                ),
              }
            : goal
        )
      : this.user.goals;

    this.user = {
      ...this.user,
      transitions: updatedTransitions,
      goals: updatedGoals,
    };
  }

  deleteTransactionById(id: string) {
    if (!this.user) return;

    const updatedTransitions = this.user.transitions.filter((transition) => transition.id !== id);

    const updatedGoals = this.user.goals.map((goal) => ({
      ...goal,
      transitions: goal.transitions?.filter((t) => t.id !== id),
    }));

    this.user = {
      ...this.user,
      transitions: updatedTransitions,
      goals: updatedGoals,
    };
  }

  // user categories
  getCategoriesByType(type: string) {
    if (!this.user || !this.user?.categories) {
      return [];
    }
    return this.user.categories.filter((category: CategoryType) => category.type === type);
  }

  addNewCategory(category: CategoryType) {
    if (!this.user) {
      return;
    }

    this.user = { ...this.user, categories: [...this.user.categories, category] };
  }

  updateCategoryById(id: string, updatedFields: Partial<CategoryType>) {
    if (!this.user) {
      return;
    }

    const updatedCategories = this.user.categories.map((category) =>
      category.id === id ? { ...category, ...updatedFields } : category
    );

    this.user = { ...this.user, categories: updatedCategories };
  }

  deleteCategoryById(id: string) {
    if (!this.user) {
      return;
    }

    const updatedCategories = this.user.categories.filter((category) => category.id !== id);

    this.user = { ...this.user, categories: updatedCategories };
  }

  // user goals
  addNewGoal(goal: GoalType) {
    if (!this.user) {
      return;
    }

    this.user = { ...this.user, goals: [...this.user.goals, goal] };
  }
}

export const userStore = new UserStore();
