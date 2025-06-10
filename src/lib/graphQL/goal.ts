import { gql } from '@apollo/client';

export const CREATE_GOAL = gql`
  mutation createGoal($data: GoalCreateInput!) {
    createGoal(data: $data) {
      id
    }
  }
`;

export const PUBLISH_GOAL = gql`
  mutation PublishGoal($id: ID!) {
    publishGoal(where: { id: $id }) {
      id
    }
  }
`;

// export const EDIT_GOAL = gql`
//   mutation EditGoal($id: ID!, $data: GoalUpdateInput!) {
//     updateGoal(where: { id: $id }, data: $data) {
//       id
//       name
//       chartColor
//       type
//     }
//   }
// `;

// export const DELETE_GOAL = gql`
//   mutation deleteGoal($id: ID!) {
//     deleteGoal(where: { id: $id }) {
//       id
//     }
//   }
// `;
