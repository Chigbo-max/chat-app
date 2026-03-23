import { gql } from "apollo-server-express";

export const conversationSchema = gql`
  scalar JSON
  scalar Date

  input CreateConversationInput {
    name: String
    isGroup: Boolean
    participantIds: [ID!]!
  }

  type Participant {
    id: ID!
    username: String!
    avatar: String
  }


  type LastMessage {
    id: ID!
    content: String
    mediaUrl: String
    sender: Participant!
    status: String!
    createdAt: Date!
  }

  type Conversation {
    id: ID!
    name: String
    isGroup: Boolean!
    participants: [Participant!]!
    admins: [ID!]!
    lastMessage: LastMessage
    lastMessageAt: Date
    unreadCounts: JSON
    createdAt: Date!
    updatedAt: Date!
  }

  type ConversationConnection {
    conversations: [Conversation!]!
    nextCursor: Date
    hasNextPage: Boolean!
  }

  type Query {
    getUserConversations(cursor: Date, limit: Int): ConversationConnection!
    getConversation(id: ID!): Conversation
    getAllUsers: [Participant!]!
  }

  type Mutation {
    createConversation(input: CreateConversationInput!): Conversation!
    addParticipant(conversationId: ID!, userId: ID!): Conversation!
    removeParticipant(conversationId: ID!, userId: ID!): Conversation!
    makeAdmin(conversationId: ID!, userId: ID!): Conversation!
    removeAdmin(conversationId: ID!, userId: ID!): Conversation!
  }
`;