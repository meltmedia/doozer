# Rapid Micro Prototyping Framework

Doozer is a python flask framework for quickly prototyping tabular results. It does automated form generation and table creation allowing you to only worry about getting the data and not how to display it.

## Installation

Use the [yeoman](http://yeoman.io/) [generator]() to get up and running quickly.

    npm install -g generator-doozer
    yo doozer

## Deploying

First build the tar ball

    python setup.py sdist upload

### Distribute

- download [distribute](http://packages.python.org/distribute/)

    $ curl -O http://python-distribute.org/distribute_setup.py

    $ sudo python distribute_setup.py

    $ rm distribute*

    $ sudo easy_install pip

## Install Virtualenv(wrapper)

    # install virtualenv and virtualenvwrapper
    $ sudo pip install virtualenv virtualenvwrapper

    # edit the .bashrc file
    $ vim .bashrc (or .profile)

    # to enable virtualenvwrapper add this line to the end of the file
    source /usr/local/bin/virtualenvwrapper.sh

    #save and quit your editor

    # exit and log back in to restart your shell
    $ exit

    # create a virtualenv, I usually give it the same name as my app
    $ mkvirtualenv <VIRTUALENV_NAME>

    # The virtualenv will be activated automatically.
    # You can deactivate it like this
    $ deactivate

    # to activate a virtualenv, or change which one is active, do this
    $ workon <VIRTUALENV_NAME>

    $ sudo pip install -r requirements.txt

If you are only intending to use doozer, there are a couple ways to get it installed. 

    $ pip install 

Clone the repository and install it.

    $ git clone git@github.com:meltmedia/doozer.git
    $ cd doozer
    $ sudo python setup.py install

## Getting going

On OS X if you are having issues using mysql (image not found) the following can help.

    $ find /usr -name libmysqlclient.18.dylib
    /usr/local/mysql-5.5.17-osx10.6-x86_64/lib/libmysqlclient.18.dylib

Add the path from the find results above to the the DYLD_LIBRARY_PATH environment variable:
  
    export DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH:/usr/local/mysql-5.5.17-osx10.6-x86_64/lib/"
