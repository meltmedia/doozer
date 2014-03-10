#!/usr/bin/env python

from __future__ import with_statement

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

import sys

if sys.version_info <= (2, 4):
    error = "ERROR: doozer requires Python Version 2.5 or above."
    print >> sys.stderr, error
    sys.exit(1)


def readme():
    try:
        with open("readme.md") as f:
            return f.read()
    except:
        return ""

setup(
    name="doozer",
    version='0.2.0',
    url="https://github.com/meltmedia/doozer/",
    license="MIT",
    author="Josh Kennedy",
    author_email="josh.kennedy@meltmedia.com",
    description="Rapid form and results Prototyping Interface",
    long_description=readme(),
    packages=["doozer", "doozer.export"],
    zip_safe=False,
    platforms='any',
    install_requires=[
        "Flask >= 0.10.1"
    ],
    include_package_data=True,
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.5',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ]
)
