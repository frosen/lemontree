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

doorIndexs = {}

heroData = []
doorData = []

# 解析触发器
def parseCo(t, lineNum, colNum, w, h, k):

    global heroData
    global doorData
    global doorIndexs

    if t == 33:
        #hero pos

        thisHeroData = {}
        thisHeroData["x"] = colNum
        thisHeroData["y"] = lineNum
        thisHeroData["area"] = k
        thisHeroData["id"] = t
        heroData.append(thisHeroData)

        return 0

    elif 34 <= t and t <= 48:
        # 门
        key = 1

        if not doorIndexs.has_key(t):
            doorIndexs[t] = 1
        else:
            doorIndexs[t] += 1

        orient = 0
        if lineNum == 0:
            orient = 1
        elif lineNum == h - 1:
            orient = 2
        elif colNum == 0:
            orient = 3
        elif colNum == w - 1:
            orient = 4
        else:
            raise RuntimeError("Wrong door at line %d, col %d" % lineNum, colNum)

        newT = key * 100000 + orient * 10000 + doorIndexs[t] * 100 + t

        thisDoorData = {}
        thisDoorData["x"] = colNum
        thisDoorData["y"] = lineNum
        thisDoorData["area"] = k
        thisDoorData["id"] = newT
        doorData.append(thisDoorData)

        return newT
    else:
        return t

areaHeroData = []
areaDoorData = {}

def parse(string, k):

    global heroData
    global doorData
    global doorIndexs
    doorIndexs = {}

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

    lineNum = 0
    for line in coLineStrs:
        coData = line.split(",")
        coLineList = []

        colNum = 0
        for coStr in coData:
            if len(coStr) < 1: continue
            tile = int(coStr)
            tile = parseCo(tile, lineNum, colNum, w, h, k)
            coLineList.append(tile)
            colNum += 1

        coList.append(coLineList)
        lineNum += 1

    data["te"] = teList
    data["co"] = coList

    # 把每个area的相关信息汇聚在一起
    for d in heroData:
        areaHeroData.append(d)
        
    heroData = []
    
    for d in doorData:
        key = d["id"]
        t = key % 100
        index = key / 100 % 100
        if not areaDoorData.has_key(t):
            areaDoorData[t] = {}

        if not areaDoorData[t].has_key(index):
            areaDoorData[t][index] = []

        areaDoorData[t][index].append(d)

    doorData = []

    return data

def parseData():
    s = 1
    for scenedata in mapdata:
        if scenedata == 1:
            break

        dataList = []
        k = 1
        for areadata in scenedata:
            if areadata == 1:
                break

            print "parse scene {} area {}".format(s, k)
            data = parse(areadata, k)
            dataList.append(data)
            k = k + 1

        data = {}
        data["areas"] = dataList
        data["heros"] = areaHeroData
        data["gates"] = areaDoorData

        jsonDataList.append(data)

        s += 1

import random
def encode(jstr):
    res = ""
    l = len(jstr)

    for i in xrange(l):
        k = (i % 7) + (i % 13)
        asc = ord(jstr[i])
        res += chr(asc - k)

    mid = int(len(res) / 2)
    resHead = res[mid:mid + 28]
    print mid
    print resHead
    th = int(len(res) / 3)
    resTh = res[th:th + 30]
    return "\x06\0" + resHead + res + resTh

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
