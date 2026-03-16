"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const user_resolver_1 = require("./user.resolver");
const conversation_resolver_1 = require("./conversation.resolver");
const message_resolver_1 = require("./message.resolver");
const notification_resolver_1 = require("./notification.resolver");
exports.resolvers = {
    Query: {
        ...user_resolver_1.userResolver.Query,
        ...conversation_resolver_1.conversationResolver.Query,
        ...message_resolver_1.messageResolver.Query,
        ...notification_resolver_1.notificationResolver.Query
    },
    Mutation: {
        ...user_resolver_1.userResolver.Mutation,
        ...conversation_resolver_1.conversationResolver.Mutation,
        ...message_resolver_1.messageResolver.Mutation,
        ...notification_resolver_1.notificationResolver.Mutation
    }
};
//# sourceMappingURL=index.js.map