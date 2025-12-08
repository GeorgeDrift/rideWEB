const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find conversations where participants array contains userId
        // Note: JSON containment query in Postgres depends on dialect options, using simple fetch-filter for compatibility if needed, 
        // but typically: where: { participants: { [Op.contains]: [userId] } }
        // For simplicity and robustness across minor sequelize versions without jsonb setup, we might fetch all or use raw query.
        // But let's try standard Sequelize JSON query first.

        let conversations = await Conversation.findAll({
            // where: { participants: { [Op.contains]: [userId] } }, -- Op.contains requires JSONB in Postgres
            // If using standard JSON text, we might need a different approach.
            // As a fallback/safe approach for this MVP:
            order: [['updatedAt', 'DESC']]
        });

        // Manual filter and mapping (performant enough for small scale)
        const userConversations = [];
        for (const conv of conversations) {
            const participants = conv.participants || [];
            if (participants.includes(userId)) {
                // Determine the other participant
                const otherUserId = participants.find(id => id !== userId);
                let otherUser = null;
                if (otherUserId) {
                    otherUser = await User.findByPk(otherUserId, { attributes: ['id', 'name', 'avatar', 'role', 'isOnline'] });
                }

                // If other user not found (deleted?), use placeholder or skip?
                const name = otherUser ? otherUser.name : 'Unknown User';
                const avatar = otherUser ? otherUser.avatar : '';
                const role = otherUser ? (otherUser.role === 'driver' ? 'Driver' : 'Rider') : 'User';
                const status = otherUser && otherUser.isOnline ? 'online' : 'offline';

                // Fetch last message if not stored on model (Model has lastMessage field)
                const lastMsg = conv.lastMessage || 'Start a conversation';

                // Get Unread count (mock or actual query)
                const unread = conv.unreadCount || 0;

                // Fetch messages? Or just summary?
                // Interface needs 'messages' array? 
                // api.ts interface: messages: Message[]
                // We should fetch last ~20 messages.
                const messages = await Message.findAll({
                    where: { conversationId: conv.id },
                    order: [['createdAt', 'ASC']], // Oldest first for chat history
                    limit: 50
                });

                userConversations.push({
                    id: conv.id,
                    name,
                    avatar,
                    role,
                    lastMessage: lastMsg,
                    time: conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unread,
                    status,
                    participants: conv.participants,
                    messages: messages.map(m => ({
                        id: m.id,
                        text: m.text,
                        sender: m.senderId === userId ? 'user' : 'other', // api.ts expects 'user' | 'agent' - strict mapping needed
                        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }))
                });
            }
        }

        res.json(userConversations);
    } catch (err) {
        console.error('getConversations error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.createConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipientId } = req.body;

        if (!recipientId) return res.status(400).json({ error: 'Recipient ID required' });

        // Check if exists
        const allConversations = await Conversation.findAll();
        let existing = null;

        for (const c of allConversations) {
            const p = c.participants || [];
            if (p.includes(userId) && p.includes(recipientId)) {
                existing = c;
                break;
            }
        }

        if (existing) {
            return res.json({ id: existing.id, exists: true });
        }

        // Create new
        // Standardize: participants sorted? No, just store.
        const newConv = await Conversation.create({
            participants: [userId, recipientId],
            lastMessage: '',
            unreadCount: 0
        });

        res.status(201).json(newConv);
    } catch (err) {
        console.error('createConversation error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    // Basic REST fallback if socket fails
    // Implement if needed
    res.status(501).json({ error: 'Use socket implementation' });
};
