/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const ClientError = require('../../exceptions/ClientError');

class PlaylistSongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addPlaylistSong({ playlistId, songId }) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    await this._cacheService.delete(`playlists:${playlistId}`);

    return result.rows[0].id;
  }

  async getPlaylistSongs(playlistId) {
    try {
      // Mendapatkan data lagu dari cache
      const result = await this._cacheService.get(`playlists:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      // mendapatkan data lagu dari database
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer
          FROM playlistsongs INNER JOIN songs ON playlistsongs.song_id = songs.id
          WHERE playlistsongs.playlist_id = $1`,
        values: [playlistId],
      };
      const result = await this._pool.query(query);

      // Lagu akan disimpan pada cache sebelum fungsi getPlaylistSongs dikembalikan
      await this._cacheService.set(`playlists:${playlistId}`, JSON.stringify(result.rows));

      return result.rows;
    }
  }

  async deletePlaylistSong(playlistId, songId) {
    const deleteQuery = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const deleteResult = await this._pool.query(deleteQuery);

    if (!deleteResult.rowCount) {
      throw new ClientError('Gagal menghapus Lagu. Id Playlist atau Lagu tidak ditemukan.');
    }

    await this._cacheService.delete(`playlists:${playlistId}`);
  }
}

module.exports = PlaylistSongsService;
