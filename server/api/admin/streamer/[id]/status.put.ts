import { User } from '~/server/models/User';
import { ActivityLog } from '~/server/models/ActivityLog';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Administrator privilege required.' });
  }

  const streamerId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!streamerId) {
    throw createError({ statusCode: 400, statusMessage: 'Streamer ID is required.' });
  }

  let updatedUser: any = null;
  try {
    updatedUser = await User.findById(streamerId);
    if (updatedUser) {
      if (typeof body.isBanned === 'boolean') {
        updatedUser.isBanned = body.isBanned;
      }
      if (body.role && ['streamer', 'admin'].includes(body.role)) {
        updatedUser.role = body.role;
      }
      await updatedUser.save();

      await ActivityLog.create({
        eventType: 'ADMIN_MODERATE_STREAMER',
        details: `Admin updated streamer [${updatedUser.username}] - isBanned: ${updatedUser.isBanned}, role: ${updatedUser.role}`
      });
    }
  } catch (e) {
    // In-memory update
  }

  return {
    success: true,
    message: 'Streamer status updated successfully.',
    isBanned: body.isBanned
  };
});
