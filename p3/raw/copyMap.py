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
    inputPath = "./map/output/"

    basePath = "../assets/script_map/"
    resPath = "../assets/resources/map/"

    # 复制到base
    copyFile(inputPath + "ele.js", basePath + "ele.js")

    # 复制到res
    for x in xrange(0, 100):
        oldResPath = inputPath + "scene" + str(x) + "/"
        if not os.path.exists(oldResPath):
            print("There is no scene " + str(x) + ", so return.")
            break

        newResPath = resPath + "scene" + str(x) + "/terrain/"
        if not os.path.exists(newResPath):
            print("Create: " + newResPath)
            os.makedirs(newResPath)

        jsFileName = "scenedata_" + str(x) + ".js"
        copyFile(oldResPath + jsFileName, basePath + jsFileName)
        copyFile(oldResPath + "tiles.png", newResPath + "tiles.png")






