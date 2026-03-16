"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
const merge_1 = require("@graphql-tools/merge");
const user_schema_1 = require("./user.schema");
const conversation_schema_1 = require("./conversation.schema");
const message_schema_1 = require("./message.schema");
const notification_schema_1 = require("./notification.schema");
exports.typeDefs = (0, merge_1.mergeTypeDefs)([
    user_schema_1.userSchema,
    conversation_schema_1.conversationSchema,
    message_schema_1.messageSchema,
    notification_schema_1.notificationSchema
]);
//# sourceMappingURL=index.js.map