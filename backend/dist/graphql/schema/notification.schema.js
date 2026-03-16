"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationSchema = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.notificationSchema = (0, apollo_server_express_1.gql) `
  scalar Date

  input GetNotificationsInput {
    userId: ID!
    limit: Int
    cursor: Date
  }

  type Notification {
    id: ID!
    userId: ID!
    type: String!
    message: String!
    isRead: Boolean!
    createdAt: Date!
  }

  type NotificationConnection {
    notifications: [Notification!]!
    nextCursor: Date
    hasNextPage: Boolean!
  }

  type Query {
    getNotifications(input: GetNotificationsInput!): NotificationConnection!
  }

  type Mutation {
    markNotificationRead(notificationId: ID!): Notification!
  }
`;
//# sourceMappingURL=notification.schema.js.map