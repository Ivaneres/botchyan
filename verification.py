import json


class UserVerification:

    def __init__(self, json_path):
        with open(json_path) as fp:
            self.users = json.load(fp)

    async def process_reaction(self, reaction, user):
        pass