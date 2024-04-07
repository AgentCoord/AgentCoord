from AgentCoord.util.converter import read_outputObject_content
from AgentCoord.RehearsalEngine_V2.Action import BaseAction

ACTION_CUSTOM_NOTE = '''
Note: You can say something before you give the final content of {OutputName}. When you decide to give the final content of {OutputName}, it should be enclosed like this:
```{OutputName}
(the content of {OutputName})
```
'''

class customAction_Finalize(BaseAction):
    def __init__(self, info, OutputName, KeyObjects) -> None:
        self.KeyObjects = KeyObjects
        self.OutputName = OutputName
        self.Action_Result = None
        self.info = info
        self.Action_Custom_Note = ACTION_CUSTOM_NOTE.format(OutputName = OutputName)

    def postRun_Callback(self) -> None:
        # extract output object
        extracted_outputObject = read_outputObject_content(self.Action_Result, self.OutputName)
        # add the extracted output object to KeyObjects
        self.KeyObjects[self.OutputName] = extracted_outputObject
    