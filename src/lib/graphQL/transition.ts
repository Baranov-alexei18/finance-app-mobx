import { gql } from '@apollo/client';

export const CREATE_TRANSITION = gql`
  mutation createTransition($data: TransitionCreateInput!) {
    createTransition(data: $data) {
      id
      amount
      createdAt
      category {
        id
        name
        chartColor
      }
      goal {
        id
        title
        targetAmount
        endDate
      }
      date
      note
      type
    }
  }
`;

export const REGISTER_CREATE_TRANSITION = gql`
  mutation PublishTransition($id: ID!) {
    publishTransition(where: { id: $id }) {
      id
    }
  }
`;

export const EDIT_TRANSITION = gql`
  mutation EditTransition($id: ID!, $data: TransitionUpdateInput!) {
    updateTransition(where: { id: $id }, data: $data) {
      id
      amount
      createdAt
      category {
        id
        name
        chartColor
      }
      date
      note
      type
    }
  }
`;

export const DELETE_TRANSITION = gql`
  mutation deleteTransition($id: ID!) {
    deleteTransition(where: { id: $id }) {
      id
    }
  }
`;
