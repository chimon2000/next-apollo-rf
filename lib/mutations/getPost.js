import { gql } from 'react-apollo'

export default gql`
  query {
      Post(id: "cixmn378k0hwn01010poqkle9") {
        id,
        title,
        url
      }
  }
`
