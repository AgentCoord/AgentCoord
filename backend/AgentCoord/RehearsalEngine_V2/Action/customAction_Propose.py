from AgentCoord.RehearsalEngine_V2.Action import BaseAction

ACTION_CUSTOM_NOTE = '''

'''

class customAction_Propose(BaseAction):
    def __init__(self, info, OutputName, KeyObjects) -> None:
        self.KeyObjects = KeyObjects
        self.OutputName = OutputName
        self.Action_Result = None
        self.info = info
        self.Action_Custom_Note = ACTION_CUSTOM_NOTE.format(OutputName = OutputName)

    