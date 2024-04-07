#!/usr/bin/env python 
# -*- coding: utf-8 -*-
from .baseAction import BaseAction
from .customAction_Finalize import customAction_Finalize
from .customAction_Improve import customAction_Improve
from .customAction_Critique import customAction_Critique
from .customAction_Propose import customAction_Propose

customAction_Dict = {"Finalize":customAction_Finalize, "Improve":customAction_Improve, "Critique":customAction_Critique, "Propose":customAction_Propose}