import { gql } from '@apollo/client';

export const CREATE_CATEGORY = gql`
  mutation createCategory($data: CategoryCreateInput!) {
    createCategory(data: $data) {
      id
    }
  }
`;

export const REGISTER_CREATE_CATEGORY = gql`
  mutation PublishCategory($id: ID!) {
    publishCategory(where: { id: $id }) {
      id
    }
  }
`;

export const EDIT_CATEGORY = gql`
  mutation EditCategory($id: ID!, $data: CategoryUpdateInput!) {
    updateCategory(where: { id: $id }, data: $data) {
      id
      name
      chartColor
      type
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation deleteCategory($id: ID!) {
    deleteCategory(where: { id: $id }) {
      id
    }
  }
`;
