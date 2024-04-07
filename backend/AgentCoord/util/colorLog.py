from termcolor import colored


# colored print
def print_colored(text, text_color="green", background="on_white"):
    print(colored(text, text_color, background))
