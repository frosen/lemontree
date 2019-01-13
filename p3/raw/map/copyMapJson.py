#!/usr/bin/python
#coding:utf-8

import json
import os
import re
import shutil

# ================================================================================

if '__main__' == __name__:
    inputPath = "./output/"

    basePath = "../../assets/script_map/"
    resPath = "../../assets/resources/map/"

    # 复制到base
    shutil.copyfile(inputPath + "MapCheck.js", basePath + "MapCheck.js")
    shutil.copyfile(inputPath + "scene0/area.json", basePath + "area.json")
    shutil.copyfile(inputPath + "scene0/tiles.png", basePath + "tiles.png")

    # 复制到res
    for x in xrange(1, 100):
        oldResPath = inputPath + "scene" + str(x) + "/"
        if not os.path.exists(oldResPath):
            break

        newResPath = resPath + "scene" + str(x) + "/terrain/"
        if not os.path.exists(newResPath):
            os.makedirs(newResPath)

        shutil.copyfile(oldResPath + "area.json", newResPath + "area.json")
        shutil.copyfile(oldResPath + "tiles.png", newResPath + "tiles.png")






