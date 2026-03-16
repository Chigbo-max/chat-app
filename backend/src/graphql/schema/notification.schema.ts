import { gql } from "apollo-server-express";

export const notificationSchema = gql`
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