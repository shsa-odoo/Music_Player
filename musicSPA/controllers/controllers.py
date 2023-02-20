# -*- coding: utf-8 -*-
import json
import os
import base64
from odoo import http
from odoo.http import Response
from odoo.modules.module import get_module_resource


class MusicSpa(http.Controller):
    @http.route('/music', auth='public')
    def index(self, **kw):
        return http.request.render('musicSPA.music_template')

    @http.route('/music/search', auth='public', type="http", methods=["GET"])
    def search(self, **kw):
        # Retrieve the song name from the search query
        song_name = kw.get('song_name')
    
        musics = http.request.env['music.player'].search_read([('name', 'ilike', song_name)],fields={"name", "url"})

        if not musics:
            return "Song not found"

        return Response(json.dumps({'result': musics }), content_type='application/json')
    

    @http.route('/music/<model("music.player"):music>', type='http', auth="user", methods=["GET"])
    def load(self, music, **kw):
        music_file_path = get_module_resource('musicSPA', 'static/songs', music.filename)
        print (music_file_path)
        file = open(music_file_path, 'rb').read()
        return file


# /home/sanjay/odoo/community/addons/musicSPA/static/songs/c

