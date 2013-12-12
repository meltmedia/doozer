import doozer
import time

from datetime import date


# Throw an error when loading the form to test the error status
class BadForm(doozer.Doozer):
    name = "Bad Form"
    path = None
    description = None

    def form(self, data):
        return 500


# Bare bones example, it will auto load the form and the results method
# simply sends static data.
class BareBones(doozer.Doozer):
    def results(self, data):
        return {
            "headers": [{"id": "name", "text": "Name"}],
            "results": [{"name": "Test"}, {"name": "Other"}]
        }


class Example(doozer.Doozer):
    # load the form from a json file and return it

    # Called to prepare the form. If no changes are needed
    #
    # It will attempt to autoload a json file with the same name
    # as the class and pass that in as data. If the data doesn't
    # need to be modified, omit this method.
    def form(self, data):
        # edit the 4th field default to the current date
        data['fields'][4]['default'] = date.today().isoformat()

        return data

    # The json data posted in is loaded and passed in. This method
    # needs to return a dictionary for success, an int for failure
    # or a flask response.
    def results(self, data):
        # Build the results header
        headers = [
            {
                "id": "name",
                "text": "Name"
            },
            {
                "id": "blob",
                "text": "Blob"
            }
        ]

        # check for a sleep in the request data and go to sleep for how
        # long it says (demonstrate a long request)
        if "sleep" in data and int(data["sleep"]) > 0:
            time.sleep(int(data["sleep"]))

        # check for a desired response code to simulate error handling
        if "rescode" in data:
            if data["rescode"].isdigit() and not data["rescode"] == "200":
                if data["rescode"] == "0":
                    return {
                        "headers": headers,
                        "results": []
                    }
                else:
                    return int(data["rescode"])

        # if there isn't an error code being returned, return some
        # valid data.
        results = []

        mod_by = len(self.possible_results)
        for x in range(0, int(data["count"])):
            results.append(self.possible_results[x % mod_by])

        return {
            "headers": headers,
            "results": results
        }

    possible_results = [
        {
            "name": "Bob",
            "blob": "Something about Bob"
        },
        {
            "name": "Jack McCoy",
            "blob": "ADA, to DA"
        },
        {
            "name": "John McClane",
            "blob": "Come out to the coast, "
                    "we'll get together, have a few laughs..."
        },
        {
            "name": "Terminator",
            "blob": "I'll be back."
        },
        {
            "name": "John Kimble",
            "blob": "It's not a tumor."
        }
    ]

# run still needs to be called, port is optional (default is 5000).
doozer.run(port=5005)
