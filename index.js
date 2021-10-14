const express = require('express')
const axios = require('axios')
const SpotifyWebApi = require('spotify-web-api-node');
const app = express()

app.use(express.static('public'))

const spotifyApi = new SpotifyWebApi({
  clientId: 'c894b2e0266c4fa6898b1dde9fa844d7',
  clientSecret: '33d21f5617c047fa91f703b343687556'
})

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

app.get('/', function (req, res) {
  spotifyApi.searchPlaylists('top')
    .then(function (topPlaylists) {
      spotifyApi.getPlaylist('37i9dQZEVXbMDoHDwVN2tF')
        .then(function (data) {
          res.render('pages/index.ejs', {
            topPlaylists: topPlaylists.body.playlists.items,
            tracks: data.body.tracks.items
          })
        }, function (err) {
          console.log('Something went wrong!', err);
        });
    }, function (err) {
      console.log('Something went wrong!', err);
    });
})

app.get('/playlist/tracks/:id', function (req, res) {
  spotifyApi.getPlaylist(req.params.id)
    .then(function (data) {
      spotifyApi.searchPlaylists('top')
        .then(function (dataHistory) {
          let items = dataHistory.body.playlists.items
          let result = items.filter(elt => elt.id == req.params.id)
          res.render('pages/playLists-tracks.ejs', {
            tracks: data.body.tracks.items,
            label: result
          })
        }, function (err) {
          console.log('Something went wrong!', err);
        });
    }, function (err) {
      console.log('Something went wrong!', err);
    });
})

app.get('/artist-search', function (req, res) {
  spotifyApi
    .searchArtists(req.query.artist)
    .then(data => {
      spotifyApi.searchTracks(req.query.artist)
        .then(function (dataLove) {
          res.render('pages/artist-search.ejs', {
            artist: data.body.artists.items,
            tracks: dataLove.body.tracks.items
          })
        }, function (err) {
          console.log('Something went wrong!', err);
        });
      console.log(data.body.artists.items[0])
    })
    .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.get('/albums/:id', function (req, res) {
  spotifyApi.getArtistAlbums(req.params.id)
    .then(function (dataAlbums) {
      spotifyApi.getArtistTopTracks(req.params.id, 'GB')
        .then(function (dataTracks) {
          res.render('pages/artist-albums.ejs', {
            tracks: dataTracks.body.tracks,
            albums: dataAlbums.body.items
          })
        }, function (err) {
          console.log('Something went wrong!', err);
        });
    }, function (err) {
      console.error(err);
    });
})

app.get('/albums/tracks/:id', function (req, res) {
  spotifyApi.getAlbumTracks(req.params.id, { limit: 10, offset: 1 })
    .then(function (data) {
      // console.log(data.body.items[0])
      spotifyApi.getArtistAlbums('0XNKQFs2Ewb3y0VsFUFc5l')
        .then(function (dataAlbum) {
          console.log('Album information', data.body);
          res.render('pages/tracks-list.ejs', {
            tracks: data.body.items,
          })
        }, function (err) {
          console.error(err);
        });
    }, function (err) {
      console.log('Something went wrong!', err);
    });
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`Listening at http://localhost:3000`)
})