from AgentCoord.RehearsalEngine_V2.Action import BaseAction

ACTION_CUSTOM_NOTE = '''
Note: Since you are in a conversation, your critique must be concise, clear and easy to read, don't overwhelm others. If you want to list some points, list at most 2 points. 

'''

class customAction_Critique(BaseAction):
    def __init__(self, info, OutputName, KeyObjects) -> None:
        self.KeyObjects = KeyObjects
        self.OutputName = OutputName
        self.Action_Result = None
        self.info = info
        self.Action_Custom_Note = ACTION_CUSTOM_NOTE.format(OutputName = OutputName)

    