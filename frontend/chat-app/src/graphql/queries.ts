import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        username
        email
        avatar
        isOnline
        lastSeen
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        username
        email
        avatar
        isOnline
        lastSeen
      }
    }
  }
`;

export const GET_USER_CONVERSATIONS = gql`
  query getUserConversations($cursor: Date, $limit: Int) {
    getUserConversations(cursor: $cursor, limit: $limit) {
      conversations {
        id
        name
        isGroup
        participants {
          id
          username
          avatar
        }
        admins
        lastMessage {
          id
          content
          sender {
            id
            username
          }
          createdAt
        }
        lastMessageAt
        unreadCounts
      }
      nextCursor
      hasNextPage
    }
    getAllUsers {
      id
      username
      avatar
    }
  }
`;

export const GET_MESSAGES = gql`
  query getMessages($conversationId: ID!, $cursor: Date, $limit: Int) {
    getMessages(conversationId: $conversationId, cursor: $cursor, limit: $limit) {
      messages {
        id
        content
        mediaUrl
        sender {
          id
          username
          avatar
        }
        reactions {
          user
          emoji
        }
        readBy
        edited
        deleted
        status
        createdAt
      }
      nextCursor
      hasNextPage
    }
  }
`;

export const GET_CONVERSATION = gql`
  query getConversation($id: ID!) {
    getConversation(id: $id) {
      id
      name
      isGroup
      participants {
        id
        username
        avatar
      }
      admins
      lastMessage {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      lastMessageAt
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation sendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      conversationId
      content
      mediaUrl
      sender {
        id
        username
        avatar
      }
      createdAt
      status
    }
  }
`;

export const CREATE_CONVERSATION_MUTATION = gql`
  mutation createConversation($input: CreateConversationInput!) {
    createConversation(input: $input) {
      id
      name
      isGroup
      participants {
        id
        username
        avatar
      }
      admins
      lastMessage {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      lastMessageAt
      createdAt
    }
  }
`;

export const REMOVE_PARTICIPANT_MUTATION = gql`
  mutation removeParticipant($conversationId: ID!, $userId: ID!) {
    removeParticipant(conversationId: $conversationId, userId: $userId) {
      id
      participants { id username avatar }
      admins
    }
  }
`;

export const MAKE_ADMIN_MUTATION = gql`
  mutation makeAdmin($conversationId: ID!, $userId: ID!) {
    makeAdmin(conversationId: $conversationId, userId: $userId) {
      id
      participants { id username avatar }
      admins
    }
  }
`;

export const REMOVE_ADMIN_MUTATION = gql`
  mutation removeAdmin($conversationId: ID!, $userId: ID!) {
    removeAdmin(conversationId: $conversationId, userId: $userId) {
      id
      participants { id username avatar }
      admins
    }
  }
`;

export const ADD_REACTION_MUTATION = gql`
  mutation addReaction($messageId: ID!, $emoji: String!) {
    addReaction(messageId: $messageId, emoji: $emoji) {
      id
      reactions {
        user
        emoji
      }
    }
  }
`;

export const REMOVE_REACTION_MUTATION = gql`
  mutation removeReaction($messageId: ID!, $emoji: String!) {
    removeReaction(messageId: $messageId, emoji: $emoji) {
      id
      reactions {
        user
        emoji
      }
    }
  }
`;

export const ADD_PARTICIPANT_MUTATION = gql`
  mutation addParticipant($conversationId: ID!, $userId: ID!) {
    addParticipant(conversationId: $conversationId, userId: $userId) {
      id
      participants { id username avatar }
      admins
    }
  }
`;