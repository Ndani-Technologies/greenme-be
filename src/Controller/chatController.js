/* eslint-disable no-throw-literal */
const mongoose = require("mongoose");
const MESSAGE = require("../Models/messageSchema");
const CONVERSATION = require("../Models/conversationSchema");

exports.getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;

    if (!id) {
      // eslint-disable-next-line no-throw-literal
      throw {
        code: 404,
        message: "Conversation ID Is Required",
        success: false,
      };
    }

    const result = await CONVERSATION.aggregate([
      // Match conversations with the given storeId
      {
        $match: {
          participants: {
            $in: [mongoose.Types.ObjectId(`${id}`)],
          },
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
      // Lookup last message for each conversation
      {
        $lookup: {
          from: "messages",
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$conversationId", "$$conversationId"] },
              },
            },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 },
          ],
          as: "lastMessage",
        },
      },
      // Lookup unread messages for each conversation
      {
        $lookup: {
          from: "messages",
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversationId", "$$conversationId"] },
                    { $eq: ["$receiver", mongoose.Types.ObjectId(`${id}`)] },
                    { $eq: ["$read", false] },
                  ],
                },
              },
            },
            {
              $count: "unreadCount",
            },
          ],
          as: "unreadMessages",
        },
      },

      // Add unreadCount field to each conversation
      {
        $addFields: {
          unreadCount: {
            $ifNull: [{ $arrayElemAt: ["$unreadMessages.unreadCount", 0] }, 0],
          },
        },
      },
      // Project only the required fields
      {
        $project: {
          _id: 1,
          participants: 1,
          initBy: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          unreadCount: 1,
          lastMessage: 1,
          __v: 1,
        },
      },

      // Sort conversations in descending order based on updatedAt field
      { $sort: { updatedAt: -1 } },

      // Pagination
      {
        $facet: {
          conversations: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const conversations = result[0]?.conversations;
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    return res.status(200).send({
      conversations,
      totalCount,
      message: "Conversation Fetched Successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error?.message ?? "Something Went Wrong",
    });
  }
};

exports.getConversationById = async (req, res, next) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 100;
    const { author, receiver, conversationId } = req.query;

    if (!author && !receiver && !conversationId) {
      throw {
        code: 404,
        success: false,
        message: "conversationId  is required",
      };
    }

    let conversation = null;

    if (author && receiver) {
      conversation = await CONVERSATION.findOne({
        participants: { $all: [author, receiver] },
        isActive: true,
      }).populate([
        {
          path: "messages",
          model: "Message",
          populate: [
            {
              path: "author",
            },
            { path: "receiver" },
          ],
        },
      ]);
      console.log({ conversation });
    } else {
      console.log("else here");
      conversation = await CONVERSATION.findOne({
        _id: conversationId,
      }).populate([
        {
          path: "messages",
          model: "Message",
          populate: [
            {
              path: "author",
            },
            { path: "receiver" },
          ],
        },
      ]);
    }

    let result = [];

    if (conversationId && conversationId !== "") {
      result = await MESSAGE.aggregate([
        {
          $match: {
            conversationId: mongoose.Types.ObjectId(conversationId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "receiver",
            foreignField: "_id",
            as: "receiver",
          },
        },
        {
          $addFields: {
            author: { $arrayElemAt: ["$author", 0] },
            receiver: { $arrayElemAt: ["$receiver", 0] },
          },
        },
        {
          $sort: { updatedAt: 1 },
        },
        {
          $facet: {
            messages: [
              {
                $skip: (page - 1) * limit,
              },
              {
                $limit: limit,
              },
              {
                $project: {
                  content: 1,
                  date: 1,
                  type: 1,
                  author: 1,
                  receiver: 1,
                  createdAt: 1,
                  read: 1,
                  uuid: 1,
                },
              },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);
    }

    const messages = result[0]?.messages;
    const totalCount = result[0]?.totalCount[0]?.count;

    return res.status(200).send({
      success: true,
      messages,
      totalCount,
      conversation: conversation || null,
      message: "messages fetched successfully",
    });
  } catch (error) {
    console.log({ error });
    return res.status(error?.code ?? 500).send({
      success: false,
      message: error?.message ?? "Something Went Wrong",
    });
  }
};
