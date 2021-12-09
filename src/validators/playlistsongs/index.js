const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistSongPayloadSchema } = require('./schema');

const PlaylistSongsValidator = {
  validatePlaylistPayload: (payload) => {
    const validatorResult = PlaylistSongPayloadSchema.validate(payload);
    if (validatorResult.error) {
      throw new InvariantError(validatorResult.error.message);
    }
  },
};

module.exports = PlaylistSongsValidator;
