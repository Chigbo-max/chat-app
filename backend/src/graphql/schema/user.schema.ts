import { gql } from "apollo-server-express";

export const userSchema = gql`
  scalar Date

  # Input for login (email/password or Google SSO)
  input LoginInput {
    email: String!
    password: String
    googleToken: String
  }

  # Input for registration (normal or Google SSO)
  input RegisterInput {
    username: String!
    email: String!
    password: String
    googleToken: String
    avatar: String
  }

  # User type
  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    isOnline: Boolean!
    lastSeen: Date
  }

  # Auth response
  type AuthResponse {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  type Mutation {
    login(input: LoginInput!): AuthResponse!
    register(input: RegisterInput!): AuthResponse!
  }
`;