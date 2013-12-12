import ConfigParser
import base64
import flask
import json
import logging
import os
import os.path

import __main__

_main_path = os.path.abspath(os.path.dirname(__main__.__file__))


class Results(object):
    raw = None

    results = []
    headers = []

    def __init__(self, data):
        self.raw = data

        self.headers = data['headers']
        self.results = data['results']

    def values(self, data='results', val='val'):
        results = []
        for row in getattr(self, data):
            results.append([i[val] for i in row])

        return results

    def dict(self, data='results', key='class', val='val'):
        results = []
        for row in getattr(self, data):
            results.append(dict((i[key], i[val]) for i in row))

        return results


class Exporter(object):
    name = None
    path = None
    description = None

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)

        if self.name is None:
            self.name = self.__class__.__name__

        if self.path is None:
            self.path = "/%s" % (
                self.__class__.__name__.lower().replace(' ', '/'))

    def _register(self, app):
        self.logger.debug(
            'loading exporter: %s, %s, %s' %
            (self.name, self.path, self.description))

        add_export(self.path, self.name, self.description)

        app.add_url_rule(
            '/exports/%s' % self.name, '%s-prompt' % self.name,
            self._form, methods=['GET'])

        app.add_url_rule(
            '/exports/%s/download' % self.name, '%s-export' % self.name,
            self._export, methods=['GET', 'POST'])

        self.register(app)

    def register(self, app):
        pass

    def load(self, name=None):
        if name is None:
            name = self.__class__.__name__.lower()

        if os.path.isfile("etc/%s.cfg" % (name)):
            filename = "etc/%s.cfg" % (name)
        elif os.path.isfile("%s/etc/%s.cfg" % (_main_path, name)):
            filename = "%s/etc/%s.cfg" % (_main_path, name)
        else:
            filename = "%s.cfg" % (name)

        try:
            config = ConfigParser.ConfigParser()
            config.read([filename])

            return config
        except:
            return None

    def form(self, data):
        if data is None:
            return flask.abort(501)
        else:
            return data

    def _form(self):
        try:
            data = self.load()
        except:
            data = None

        response = self.form(data)

        if isinstance(response, dict):
            return flask.jsonify(response)
        elif isinstance(response, int):
            flask.abort(response)
        else:
            return response

    def export(self, form=None, results=None):
        return flask.abort(501)

    def _export(self):
        try:
            data = json.loads(base64.b64decode(flask.request.args.get('data')))
        except:
            data = json.loads(base64.b64decode(flask.request.data))

        form = data['form']
        results = Results(data['results'])

        response = self.export(form=form, results=results)

        if isinstance(response, dict):
            return flask.jsonify(response)
        elif isinstance(response, int):
            flask.abort(response)
        else:
            return response

modules = []


def add_export(uri, name=None, description=None):
    if name is None:
        name = uri

    modules.append({"uri": uri, "name": name, "description": description})
