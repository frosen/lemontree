#!/usr/bin/python
#coding:utf-8

import json
import os
import re
import shutil
import math

# ================================================================================

spineFrom = 49
spineTo = 64
allSpines = []
for x in xrange(spineFrom, spineTo + 1):
    allSpines.append(x)

# 不可用的spine的替代品
spineDisableRule = {
    {"spine": 49, "replace": 1},
    {"spine": 50, "replace": 1},
    {"spine": 51, "replace": 1},
    {"spine": 52, "replace": 0},

    {"spine": 53, "replace": 0},
}

# 场景对应的可以用的spine
sceneSpineRule = {
    0 : allSpines,
    10: [53],
    11: [53],
    20: [49, 50, 51, 53],
    21: [49, 50, 51, 53],
}

# ================================================================================

eleDatas = []

eleResBase = []
eleRes = []
eleResList = []

def readFile(filePath):
    fp = None
    d = ""
    try:
        fp = open(filePath, "r")
        d = fp.read()

    except Exception, e:
        print("read " + filePath + " exception! " + str(Exception) + ":" + str(e))

    finally:
        if fp: fp.close()

    if d == "":
        print("read " + filePath + " no res! ")
    return d

# 先获取所有tmx的数据 
# 文件以ele_xx_x_??.tmx的形式命名
def getTMXFiles(path):
    fList = os.listdir(path)
    for f in fList:
        fileInfos = os.path.splitext(f)
        if fileInfos[1] == '.tmx':
            d = readFile(path + f)
            indexs = fileInfos[0].split("_")
            if indexs[0] != "ele":
                continue

            size = int(indexs[1])
            w = math.floor(size / 10)
            h = size % 10

            data = {}
            data["w"] = w
            data["h"] = h
            data["d"] = d
            eleDatas.append(data)

# ================================================================================

def getDataFromTileJson(jsonStr, key):
    k1 = "<layer name=\"" + key + r"\"([\s\S]*?)</layer>"
    k2 = r"<data encoding=\"csv\">\n([\s\S]*?)\n</data>"
    subStr = re.findall(k1, jsonStr)[0]
    subStr = re.findall(k2, subStr)[0]
    lineStrs = subStr.split("\n")
    tilelist = []
    for line in lineStrs:
        tileData = line.split(",")
        tileLineList = []
        for tileStr in tileData:
            if len(tileStr) < 1: continue
            tile = int(tileStr)
            tileLineList.append(tile)

        tilelist.append(tileLineList)

    return tilelist

def getSpine(noList):
    spines = []
    for line in noList:
        for tile in line:
            if spineFrom <= tile and tile <= spineTo:
                if not tile in spines:
                    spines.append(tile)

    return spines


def parseData():

    for eleData in eleDatas:
        # 从json string提取tile数据
        coList = getDataFromTileJson(eleData.d, "collision") # 碰撞
        noList = getDataFromTileJson(eleData.d, "notation") # 标记

        spines = getSpine(noList)


        base = {}
        base["tW"] = eleData.w
        base["tH"] = eleData.h
        base["co"] = coList



# ================================================================================

if '__main__' == __name__:
    path = "./map/"
    outPath = "./map/output/ele/"

    print "go to create ELE"

    getTMXFiles(path)
    parseData()
    saveEncryptInfo(outPath)
    saveJsonAndImg(outPath, path)
    print "finish at: " + outPath





