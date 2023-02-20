# -*- coding: utf-8 -*-

from odoo import models, fields, api

class music__spa(models.Model):
    _name = 'music.player'
    _description = 'A simple music player to search and listen to your songs'

    name = fields.Char('Song Name')
    filename = fields.Char("File name")
    url = fields.Char(compute="_compute_url")

    def _compute_url(self):
        for record in self:
            record.url = record.get_base_url() + '/music/' + str(record.id)