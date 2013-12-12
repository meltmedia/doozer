
all: prep test run

prep:
	@pip install -r requirements.txt > /dev/null
	@find . -name "*.pyc" -delete

test: prep unittest lint

bootstrap:
	@cd bootstrap; npm install
	@cd bootstrap; grunt dist;
	@mkdir -p doozer/data/static/bootstrap
	@cp -r bootstrap/dist/css doozer/static/bootstrap/
	@cp -r bootstrap/dist/js doozer/static/bootstrap/
	@cp -r bootstrap/dist/fonts doozer/static/bootstrap/

unittest:
	@nosetests --with-coverage --cover-html --cover-erase --cover-branches --cover-package=example --cover-package=doozer

lint:
	@find . -name '*.py' -exec flake8 {} \;

verboselint:
	@find . -name '*.py' -exec flake8 --show-pep8 --show-source {} \;

run: prep
	@python example.py

doc:
	@groc

# remove the doc folder
clean:
	@find . -name "*.pyc" -delete
	@rm -r cover
	@rm -r doc

.PHONY: doc clean all test run prep lint unittest systemtest bootstrap
