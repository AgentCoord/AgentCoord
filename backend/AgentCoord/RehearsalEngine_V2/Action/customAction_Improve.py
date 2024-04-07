from AgentCoord.RehearsalEngine_V2.Action import BaseAction

ACTION_CUSTOM_NOTE = '''
Note: You can say something before you provide the improved version of the content.
The improved version you provide must be a completed version (e.g. if you provide a improved story, you should give completed story content, rather than just reporting where you have improved).
When you decide to give the improved version of the content, it should be start like this:

## Improved version of xxx
(the improved version of the content)
```

'''

class customAction_Improve(BaseAction):
    def __init__(self, info, OutputName, KeyObjects) -> None:
        self.KeyObjects = KeyObjects
        self.OutputName = OutputName
        self.Action_Result = None
        self.info = info
        self.Action_Custom_Note = ACTION_CUSTOM_NOTE.format(OutputName = OutputName)

    