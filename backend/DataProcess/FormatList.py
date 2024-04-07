class FormatList:
    _list = []
    offset: int = 0

    def __init__(self, input_list: list, offset: int = 0):
        self._list = input_list.copy()
        self.offset = offset

    def __str__(self):
        s = str("")
        if len(self._list) <= 0:
            return s
        if len(self._list) == 1:
            return self._list[0]
        if len(self._list) == 2:
            return " and ".join(self._list)
        if len(self._list) > 2:
            return ", ".join(self._list[:-1]) + " and " + self._list[-1]

    def Format(self):
        s = str("")
        if len(self._list) <= 0:
            return s
        if len(self._list) == 1:
            return TransToFrontFormat(0 + self.offset)
        if len(self._list) == 2:
            return " and ".join(
                [
                    TransToFrontFormat(i + self.offset)
                    for i in range(len(self._list))
                ]
            )
        if len(self._list) > 2:
            return (
                ", ".join(
                    [
                        TransToFrontFormat(i + self.offset)
                        for i in range(len(self._list) - 1)
                    ]
                )
                + " and "
                + TransToFrontFormat(len(self._list) - 1 + self.offset)
            )


def TransToFrontFormat(index: int):
    return "!<" + str(index) + ">!"
