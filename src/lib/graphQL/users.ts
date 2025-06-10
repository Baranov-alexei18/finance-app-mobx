import { gql } from '@apollo/client';

export const REGISTER_CREATE_USER = gql`
  mutation PublishUser($id: ID!) {
    publishAuthUser(where: { id: $id }) {
      id
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUser($email: String!) {
    authUser(where: { email: $email }) {
      id
      email
      password
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserId($id: ID!) {
    authUser(where: { id: $id }) {
      id
      email
      password
      name
      avatar {
        id
        url
      }
      transitions {
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
      categories {
        id
        name
        type
        chartColor
        updatedAt
        publishedAt
      }
      goals {
        id
        title
        targetAmount
        endDate
        transitions {
          id
          amount
          category {
            name
          }
          date
          note
        }
      }
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($data: AuthUserCreateInput!) {
    createAuthUser(data: $data) {
      id
    }
  }
`;

export const GET_AUTH_USERS = gql`
  query GetAuthUsers {
    authUsers {
      id
    }
  }
`;

export const EDIT_USER = gql`
  mutation EditUser($id: ID!, $data: AuthUserUpdateInput!) {
    updateAuthUser(where: { id: $id }, data: $data) {
      id
      name
      password
      avatar {
        id
      }
    }
  }
`;

export const SAVE_AVATAR = gql`
  mutation CreateUser($data: AuthUserCreateInput!) {
    createAuthUser(data: $data) {
      id
    }
  }
`;
