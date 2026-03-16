"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.messageSchema = (0, apollo_server_express_1.gql) `
  scalar Date

  input SendMessageInput {
    conversationId: ID!
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
    userId: ID!
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
    getMessages(conversationId: ID!, cursor: Date, limit: Int): MessageConnection!
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): Message!
    editMessage(input: EditMessageInput!): Message!
    deleteMessage(messageId: ID!): Message!
    addReaction(input: AddReactionInput!): Message!
    removeReaction(input: AddReactionInput!): Message!
    markMessageRead(messageId: ID!): Message!
  }
`;
//# sourceMappingURL=message.schema.js.map