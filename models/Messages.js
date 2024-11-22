import mongoose, { Schema, model } from 'mongoose';

const messageSchema = new Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.models.Message || model('Message', messageSchema);

export default Message;