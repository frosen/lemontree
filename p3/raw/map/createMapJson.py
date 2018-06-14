#!/usr/bin/python
#coding:utf-8

import json
import os
import re
import shutil

arrayMax = 20

mapdata = [1] * arrayMax

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

def saveFile(path, data):
    fp = None
    try:
        fp = open(path, "w")
        fp.write(data)

    except Exception, e:
        print("save " + path + " exception! " + str(Exception) + ":" + str(e))

    finally:
        if fp: fp.close()

def getTMXFiles(path):
    fList = os.listdir(path)
    for f in fList:
        fileInfos = os.path.splitext(f)
        if fileInfos[1] == '.tmx':
            d = readFile(path + f)
            indexs = fileInfos[0].split("_")
            i = int(indexs[1]) - 1
            j = int(indexs[2]) - 1
            if mapdata[i] == 1:
                mapdata[i] = [1] * arrayMax

            mapdata[i][j] = d

jsonDataList = []

# 去掉碰撞层的影响
def parseTe(t):
    if t > 256:
        return t - 256
    else:
        return t

doorData = {}

# 解析触发器
def parseCo(t, lineNum, colNum, w, h):
    if 32 <= t and t < 48:
        # 门
        key = 1

        if not doorData.has_key(t):
            doorData[t] = 1
        else:
            doorData[t] += 1

        orient = 0
        if lineNum == 1:
            orient = 1
        elif lineNum == h:
            orient = 2
        elif colNum == 1:
            orient = 3
        elif colNum == w:
            orient = 4
        else:
            raise RuntimeError("Wrong door at line %d, col %d" % lineNum, colNum)

        return key * 100000 + orient * 10000 + doorData[t] * 100 + t
    else:
        return t


def parse(string):
    data = {}

    wStr = re.findall(r" width=\"(.+?)\"", string)[0]
    hStr = re.findall(r" height=\"(.+?)\"", string)[0]
    w = int(wStr)
    h = int(hStr)
    data["w"] = w
    data["h"] = h

    teStr = re.findall(r"<layer name=\"terrain\"([\s\S]*?)</layer>", string)[0]
    teStr = re.findall(r"<data encoding=\"csv\">\n([\s\S]*?)\n</data>", teStr)[0]
    teList = []
    teLineStrs = teStr.split("\n")
    for line in teLineStrs:
        tileData = line.split(",")
        tileLineList = []
        for tileStr in tileData:
            if len(tileStr) < 1: continue
            tile = int(tileStr)
            tile = parseTe(tile)
            tileLineList.append(tile)

        teList.append(tileLineList)

    coStr = re.findall(r"<layer name=\"collision\"([\s\S]*?)</layer>", string)[0]
    coStr = re.findall(r"<data encoding=\"csv\">\n([\s\S]*?)\n</data>", coStr)[0]
    coList = []
    coLineStrs = coStr.split("\n")

    lineNum = 1
    for line in coLineStrs:
        coData = line.split(",")
        coLineList = []

        colNum = 1
        for coStr in coData:
            if len(coStr) < 1: continue
            tile = int(coStr)
            tile = parseCo(tile, lineNum, colNum, w, h)
            coLineList.append(tile)
            colNum += 1

        coList.append(coLineList)
        lineNum += 1

    data["te"] = teList
    data["co"] = coList

    return data

def parseData():
    for scenedata in mapdata:
        if scenedata == 1:
            break

        dataList = []
        for areadata in scenedata:
            if areadata == 1:
                break

            data = parse(areadata)
            dataList.append(data)

        jsonDataList.append(dataList)

def encode(jstr):
    res = "{"
    l = len(jstr)
    kl = l % 4

    for i in xrange(l):
        k = kl + (i % 5)
        if i % 2 == 0:
            k += 1
        if i % 3 == 0:
            k += 1
        if i % 14 < 7:
            k += 1

        asc = ord(jstr[i])

        if asc > 75:
            res += chr(asc - k)
        else:
            res += chr(asc + k)

    res += "}"

    return res

def saveJsonAndImg(path, oldPath):
    index = 1
    for jsonData in jsonDataList:
        jsonStr = json.dumps(jsonData)

        jsonStr = encode(jsonStr)

        realPath = path + "scene" + str(index) + "/"
        if not os.path.exists(realPath):
            os.makedirs(realPath)

        realFile = realPath + "area.ini"
        saveFile(realFile, jsonStr)

        oldImgName = oldPath + "scene_" + str(index) + ".png"
        newImgName = realPath + "tiles.png"
        shutil.copyfile(oldImgName, newImgName)

        index += 1


############| main |############
if '__main__' == __name__:
    path = "./"
    # outPath = "../assets/resources/map/"
    outPath = "./output/"
    getTMXFiles(path)
    parseData()
    saveJsonAndImg(outPath, path)
    print "finish at: " + outPath
