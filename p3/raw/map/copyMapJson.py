#!/usr/bin/python
#coding:utf-8

import json
import os
import re
import shutil

# ================================================================================

def copyFile(fromF, toF):
    print("copy: " + fromF + " >>> " + toF)
    shutil.copyfile(fromF, toF)

if '__main__' == __name__:
    inputPath = "./output/"

    basePath = "../../assets/script_map/"
    resPath = "../../assets/resources/map/"

    # 复制到base
    copyFile(inputPath + "MapCheck.js", basePath + "MapCheck.js")
    copyFile(inputPath + "scene0/area.json", basePath + "area.json")
    copyFile(inputPath + "scene0/tiles.png", basePath + "tiles.png")

    # 复制到res
    for x in xrange(1, 100):
        oldResPath = inputPath + "scene" + str(x) + "/"
        if not os.path.exists(oldResPath):
            print("There is no scene " + str(x) + ", so return.")
            break

        newResPath = resPath + "scene" + str(x) + "/terrain/"
        if not os.path.exists(newResPath):
            print("Create: " + newResPath)
            os.makedirs(newResPath)

        copyFile(oldResPath + "area.json", newResPath + "area.json")
        copyFile(oldResPath + "tiles.png", newResPath + "tiles.png")






