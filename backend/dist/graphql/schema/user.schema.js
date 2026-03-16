"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.userSchema = (0, apollo_server_express_1.gql) `
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
//# sourceMappingURL=user.schema.js.map