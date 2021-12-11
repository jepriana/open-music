const CollaborationsHanler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, playlistsService, validator }) => {
    const collaborationsHandler = new CollaborationsHanler(
      collaborationsService, playlistsService, validator,
    );

    server.route(routes(collaborationsHandler));
  },
};
