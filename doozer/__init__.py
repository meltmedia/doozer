import flask
import json
import logging
import os
import os.path

import doozer.export as export
import doozer.export.defaults

import __main__

from werkzeug.serving import run_simple

__version__ = "0.2.0"

__author__ = "jkennedy"

__init__ = ['register']

# Should find a way to include custom templates
# and static files.
_root = os.path.abspath(os.path.dirname(__file__))
_main_path = os.path.abspath(os.path.dirname(__main__.__file__))

LOG_LEVEL = 'debug'
LOG_FORMAT = '%(asctime)s [%(name)s] %(levelname)s %(message)s'
LOG_DATE = '%Y-%m-%d %I:%M:%S %p'
logging.basicConfig(format=LOG_FORMAT,
                    datefmt=LOG_DATE,
                    level=LOG_LEVEL.upper())


app = flask.Flask(
    "rapid",
    static_folder=os.path.join(_root, 'static')
)

_modules = []


class Doozer(object):
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
        add_module(self.path, self.name, self.description)
        app.add_url_rule(
            '%s/form' % (self.path),
            '%s-form' % (self.name),
            self._form,
            methods=['GET'])

        app.add_url_rule(
            '%s/results' % (self.path),
            '%s-results' % (self.name),
            self._results,
            methods=['POST'])

        self.register(app)

    def register(self, app):
        pass

    def load(self, name=None):
        if name is None:
            name = self.__class__.__name__.lower()

        if os.path.isfile("forms/%s.json" % (name)):
            return json.load(file("forms/%s.json" % (name)))

        if os.path.isfile("%s/forms/%s.json" % (_main_path, name)):
            return json.load(file("%s/forms/%s.json" % (_main_path, name)))

        return json.load(file("%s.json" % (name)))

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

    def results(self, data):
        return flask.abort(501)

    def _results(self):
        try:
            data = json.loads(flask.request.data)
        except:
            data = flask.request.data

        response = self.results(data)

        if isinstance(response, dict):
            return flask.jsonify(response)
        elif isinstance(response, int):
            flask.abort(response)
        else:
            return response


def register(uri, name=None, desc=None):
    def decorator(f):
        add_module(uri, name, desc)
        return f

    return decorator


def add_module(uri, name=None, description=None):
    if name is None:
        name = uri

    _modules.append({"uri": uri, "name": name, "description": description})


@app.route('/')
def home():
    return flask.send_from_directory(app.static_folder, 'index.html')


@app.route('/routes')
def routes():
    return flask.jsonify({"routes": _modules})


@app.route('/exports')
def exports():
    return flask.jsonify({"exports": export.modules})


def get_subclasses(c):
    subclasses = c.__subclasses__()
    for d in list(subclasses):
        subclasses.extend(get_subclasses(d))
    return subclasses


def run(host="0.0.0.0", port=5000, reloader=True):
    # auto instantiate endpoints
    for klass in get_subclasses(Doozer):
        instance = klass()
        instance._register(app)

    for klass in get_subclasses(export.Exporter):
        instance = klass()
        instance._register(app)

    run_simple(
        host, port, app, threaded=True,
        use_reloader=reloader, use_debugger=True, use_evalex=True)
