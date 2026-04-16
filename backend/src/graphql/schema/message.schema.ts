import { gql } from "apollo-server-express";

export const messageSchema = gql`
  scalar Date

  input SendMessageInput {
    conversationId: ID
    recipientId: ID
    content: String
    mediaUrl: String
  }

  input EditMessageInput {
    messageId: ID!
    content: String!
  }

  input AddReactionInput {
    messageId: ID!
    emoji: String!
  }

  type Reaction {
    user: ID!
    emoji: String!
  }

  type Message {
    id: ID!
    conversationId: ID!
    sender: Participant!
    content: String
    mediaUrl: String
    reactions: [Reaction!]!
    readBy: [ID!]!
    edited: Boolean!
    deleted: Boolean!
    status: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type MessageConnection {
    messages: [Message!]!
    nextCursor: Date
    hasNextPage: Boolean!
  }

  type Query {
    getMessages(
      conversationId: ID!
      cursor: Date
      limit: Int
    ): MessageConnection!
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): Message!
    editMessage(input: EditMessageInput!): Message!
    deleteMessage(messageId: ID!): Message!
    addReaction(messageId: ID!, emoji: String!): Message!
    removeReaction(messageId: ID!, emoji: String!): Message!
    markMessageRead(messageId: ID!): Message!
  }
`;
