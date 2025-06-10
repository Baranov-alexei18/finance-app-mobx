import { gql } from '@apollo/client';

export const GET_ASSETS_BY_IDS = gql`
  query GetAssetsByIds($ids: [ID!]!) {
    assets(where: { id_in: $ids }) {
      id
      url
      fileName
    }
  }
`;
